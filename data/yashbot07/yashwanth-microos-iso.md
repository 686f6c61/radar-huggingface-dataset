# Yashbot07/yashwanth-microos-iso

## Resumen

Yashwanth Micro-OS es un sistema operativo mínimo de tipo "micro-OS" escrito en Rust (`no_std`) para la arquitectura x86_64, publicado en Hugging Face como una imagen ISO arrancable. No se trata de un modelo de inteligencia artificial ni de pesos neuronales, sino de un artefacto de software: un kernel educativo desarrollado como trabajo de evaluación continua (CA-6) de la asignatura de Sistemas Operativos. El repositorio contiene únicamente la ISO resultante, de aproximadamente 2,5 MB.

El componente técnico destacable es su planificador de tareas Round-Robin con "quantum dinámico", implementado sobre un kernel Rust sin dependencias de la biblioteca estándar. El arranque se gestiona mediante el bootloader Limine, con soporte híbrido para UEFI y Legacy BIOS mediante El Torito. El proyecto se complementa con código fuente en GitHub y una demo interactiva en un Hugging Face Space.

Por su naturaleza, esta ficha no puede seguir el esquema habitual de un modelo de lenguaje: no hay parámetros, contexto, cuantizaciones ni benchmarks de inferencia. Se documenta como artefacto de sistemas operativos, indicando explícitamente los campos que no aplican o no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | x86_64 (Intel/AMD 64-bit) |
| Parametros totales | no aplica (no es un modelo de IA) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no aplica; artefacto distribuido como imagen ISO (`yashwanth_micro_os.iso`, ~2,5 MB) |
| Bootloader | Limine (UEFI + Legacy BIOS El Torito Hybrid) |
| Lenguaje del kernel | Rust (`no_std`) |
| Planificador | Round-Robin con quantum dinamico |
| Tamano del repositorio | 0,0 GB (segun Hugging Face) |

## Arquitectura y entrenamiento

El artefacto es un kernel monolítico mínimo escrito en Rust con el atributo `no_std`, es decir, sin enlazar contra la biblioteca estándar de Rust ni contra una libc de sistema. Se compila para el target x86_64 y se empaqueta en una ISO híbrida que Limine puede arrancar tanto en firmware UEFI como en BIOS heredado mediante El Torito. La funcionalidad central descrita es un planificador Round-Robin con quantum dinámico, que reparte el tiempo de CPU entre tareas y ajusta la duración del quantum según algún criterio no detallado en la información disponible.

No existe entrenamiento, dataset, RLHF ni proceso de ajuste: no es un modelo neuronal. Tampoco se especifican en la información proporcionada detalles sobre gestión de memoria, interrupciones, drivers o el algoritmo exacto que modula el quantum dinámico; esos datos requerirían consultar el repositorio de GitHub enlazado en la model card.

## Capacidades

- Arranque bare-metal en máquinas x86_64 mediante firmware UEFI o BIOS heredado (ISO híbrida El Torito).
- Ejecución de un kernel en Rust `no_std` sin dependencias de sistema operativo anfitrión.
- Planificación de tareas con Round-Robin y quantum dinámico, con trazas de tareas visibles en el arranque.
- Salida de depuración por puerto serie (`-serial stdio` en QEMU).
- Ejecución en máquina virtual (VirtualBox, QEMU) para pruebas y demostración.
- Demo interactiva en un Hugging Face Space asociado.
- No ofrece generación de texto, razonamiento, código, visión, tool calling, agentes ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Docencia de sistemas operativos: sirve como ejemplo ejecutable de un kernel mínimo con planificador Round-Robin para ilustrar conceptos de planificación de CPU en clase o laboratorio.
- Prácticas de arranque bare-metal: permite a estudiantes experimentar con Limine, ISO híbridas UEFI/BIOS y el ciclo de arranque en x86_64 sin montar un entorno complejo.
- Introducción a Rust `no_std`: el proyecto muestra cómo estructurar un kernel en Rust sin biblioteca estándar, útil como plantilla de partida para cursos de programación de sistemas.
- Pruebas en QEMU: la ISO puede arrancarse con `qemu-system-x86_64 -cdrom ... -serial stdio` para observar trazas del planificador, lo que facilita la validación automatizada en entornos de CI educativos.
- Demostración en VirtualBox: creación de una VM "Other Linux 64-bit" y montaje de la ISO en la unidad óptica para ver el bootloader y las trazas del kernel, adecuado para presentaciones o evaluaciones.
- Referencia para comparar planificadores: el quantum dinámico puede contrastarse con Round-Robin clásico o con planificadores por prioridad en ejercicios de análisis de latencia y fairness.
- Material complementario de portafolio: el par GitHub + Hugging Face Space permite enlazar código, informe y demo en una entrega académica o publicación técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de latencia, throughput, uso de CPU ni comparaciones cuantitativas del planificador.

## Requisitos de hardware

- VRAM: no aplica (no es un modelo de IA).
- CPU: cualquier procesador x86_64 (Intel/AMD de 64 bits) con soporte UEFI o BIOS heredado.
- Memoria RAM: no especificada en la información disponible; por el tamaño del kernel (~2,5 MB) se espera un requisito muy bajo, pero no hay cifra oficial.
- Almacenamiento: la ISO ocupa aproximadamente 2,5 MB.
- Cabe en cualquier equipo consumer actual; no requiere GPU.
- Despliegue: QEMU (`qemu-system-x86_64 -cdrom yashwanth_micro_os.iso -serial stdio`) o VirtualBox (VM "Other Linux 64-bit" con la ISO en la unidad óptica).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Proyecto | Tipo | Lenguaje | Bootloader | Planificador | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Yashwanth Micro-OS | Micro-kernel educativo | Rust (`no_std`) | Limine (UEFI + BIOS) | Round-Robin con quantum dinamico | no disponible | ISO en Hugging Face + GitHub + Space |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de proyectos directamente comparables con datos verificables (parámetros, contexto, rendimiento, licencia). Cualquier comparación con otros micro-kernels educativos requeriría consultar sus respectivas fuentes.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no procesa lenguaje natural ni admite prompts. Cualquier uso esperando comportamiento de LLM es un error de categoría.
- Funcionalidad muy acotada: la model card solo describe el arranque y el planificador; no se documentan drivers, sistema de ficheros, red ni interfaz de usuario.
- Licencia no disponible: no se indica licencia en Hugging Face, por lo que el uso comercial, la redistribución o la modificación no están claramente autorizados. Conviene consultar el repositorio de GitHub antes de reutilizarlo.
- Proyecto académico: está vinculado a una evaluación continua (CA-6) de una asignatura, sin garantías de mantenimiento, soporte ni estabilidad.
- Sin métricas publicadas: no hay benchmarks del planificador ni datos de rendimiento que permitan evaluar su comportamiento frente a alternativas.
- Idiomas y documentación: la información disponible está en inglés; no se especifican idiomas soportados por el sistema.
- Riesgo en hardware real: al ser un micro-OS educativo, es previsible que solo funcione de forma fiable en entornos virtualizados; no hay evidencia de validación en hardware físico.
- Repositorio de 0,0 GB según Hugging Face: el tamaño reportado no refleja el contenido real de la ISO (~2,5 MB); conviene verificar la integridad del artefacto antes de usarlo.

## Enlaces

- Hugging Face (artefacto ISO): https://huggingface.co/Yashbot07/yashwanth-microos-iso
- Hugging Face Space (demo interactiva): https://huggingface.co/spaces/Yashbot07/yashwanth-micro-os-scheduler
- GitHub (código fuente e informes): https://github.com/yash28062007-max/yashwanth-micro-os-scheduler
