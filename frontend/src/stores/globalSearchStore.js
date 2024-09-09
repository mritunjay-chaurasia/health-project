import { create } from 'zustand';

const globalSearchStore = create((set) => ({
    tableData: [],
    tableLoader: false,
    tablePage: 1,
    tableTotalPages: 0,

    setTableTotalPages: (response) => set(() => ({
        tableTotalPages: response
    })),
    setTablePage: (response) => set(() => ({
        tablePage: response
    })),
    setTableLoader: (response) => set(() => ({
        tableLoader: response
    })),
    setTableData: (response) => set(() => ({
        tableData: response
    }))
}));

export default globalSearchStore;
