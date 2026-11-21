# OS Scheduling Visualizer

An interactive web-based application developed to demonstrate and visualize **Disk Scheduling and CPU Scheduling algorithms**. The project helps students understand how operating systems manage disk requests and CPU processes through graphical representations, step-by-step execution, and performance analysis.

## Project Overview

The OS Scheduling Visualizer demonstrates different scheduling algorithms using an interactive interface. Users can enter their own inputs, execute scheduling algorithms, and observe how requests and processes are handled.

The project is divided into two main modules:

- **Part A – Disk Scheduling**
- **Part B – CPU Scheduling**

## Features

### Part A – Disk Scheduling

The disk scheduling module demonstrates five disk scheduling algorithms:

1. FCFS (First Come First Serve)
2. SSTF (Shortest Seek Time First)
3. SCAN
4. C-SCAN (Circular SCAN)
5. LOOK

**Features:**

- Enter disk size and initial head position.
- Add, remove, and clear disk requests.
- Select the disk head movement direction.
- Visualize disk head movement using a seek sequence graph.
- Display the request service sequence.
- Calculate total head movement.
- Compare the performance of different algorithms using a bar chart.
- Navigate through execution steps using Previous and Next.
- Use Auto Play to observe the scheduling process.

### Part B – CPU Scheduling

The CPU scheduling module demonstrates two CPU scheduling algorithms:

1. FCFS (First Come First Serve)
2. Round Robin (RR)

**Features:**

- Add processes with Process ID, Arrival Time, Burst Time, and Priority.
- Delete processes and load sample processes.
- Set the time quantum for Round Robin scheduling.
- Visualize process execution using an animated Gantt chart.
- Display the Live Ready Queue.
- Show the currently running process.
- Display waiting processes in the Ready Queue.
- Track completed processes.
- Calculate waiting time and turnaround time for each process.
- Calculate average waiting time and average turnaround time.
- Navigate through execution steps using Previous and Next.
- Use Auto Play to visualize process execution.

## Technologies Used

- **HTML5** – Structure of the application.
- **CSS3** – Styling and responsive design.
- **JavaScript** – Scheduling algorithms and interactive functionality.
- **SVG** – Disk scheduling graph visualization.

## How to Run

1. Clone or download this repository.
2. Open the project folder in a code editor such as Visual Studio Code.
3. Open `index.html` in a web browser.
4. Select Disk Scheduling or CPU Scheduling.
5. Enter the required inputs and run the scheduling algorithms.
6. Explore the visualizations using the available controls.

Alternatively, you can use the Live Server extension in Visual Studio Code to run the project.



## Conclusion

The OS Scheduling Visualizer provides an interactive way to understand disk and CPU scheduling algorithms. It combines graphical representations, step-by-step execution, live queue visualization, and performance analysis to make operating system concepts easier to learn and understand.

