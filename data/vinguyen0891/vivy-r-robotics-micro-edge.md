# vinguyen0891/Vivy-R-Robotics-Micro-Edge

## Resumen

`Vivy-R-Robotics-Micro-Edge` (identificador interno `R-ROBOTICS-MICRO-EDGE`) es una política de control robótico ultracompacta publicada por el usuario `vinguyen0891` en Hugging Face. No es un modelo de lenguaje: se distribuye como un contenedor binario propietario de 95.824 bytes (93,58 KB) con 24.597 parámetros y 98.388 bytes de huella en RAM en FP32, y su función es generar comandos articulares a 50 Hz (dt = 20,0 ms) para robots embebidos de 6 a 23 grados de libertad. El autor la presenta como la edición "micro-edge" de la familia Vivy, orientada a placas de 512 MB–1 GB de RAM sin GPU.

El interés práctico está en la relación entre tamaño y latencia declarada: 0,0680 ms de media y 0,1592 ms de p99 en un solo hilo de CPU, lo que según la model card deja un margen de 395x sobre el presupuesto de tiempo real de 20 ms. El paquete cubre ocho habilidades (marcha omnidireccional en terreno irregular, recuperación de caída, levantarse boca arriba y boca abajo con giro de 180°, sentarse/levantarse, recogida de objetos del suelo, golpeo de balón, roulade frontal de 360° y locomoción sobre patines) y cuatro morfologías con el mismo contenedor `.vcore`.

La relevancia es doble: por un lado, demuestra que una política de control puede caber en caché L2 de una SBC barata; por otro, sus pesos están cifrados y el autor declara explícitamente `open_source_weights = False`, de modo que el artefacto es inspeccionable y ejecutable pero no reentrenable ni auditable. La licencia `vcesl-1.0-commercial-enterprise` condiciona además cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. El autor solo describe el contenedor como "3-Cores-in-1" (`VIVY_CORE_TRI_ENC_V1`); no se detalla la topología interna (capas, tipo de política, encoder de estado) ni el algoritmo de entrenamiento |
| Parametros totales | 24.597 parámetros (98.388 bytes en FP32) |
| Parametros activos | No aplica: no es un modelo MoE ni se documenta dispersión |
| Longitud de contexto | No disponible / no aplica. La interfaz es tensorial, no textual: entradas de 28, 48, 61 y 88 valores según morfología, y salidas de 6, 12, 14 y 23 comandos articulares |
| Tipos de cuantizacion | No disponible. La model card solo reporta huella en FP32 (98.388 bytes); no se publican variantes INT8/INT4 ni GGUF |
| Idiomas soportados | No disponible / no aplica: no procesa lenguaje natural |
| Licencia | `vcesl-1.0-commercial-enterprise` (campo `license: other` en el repositorio) |
| Formato de pesos | `.vcore` (contenedor binario propietario `VIVY_CORE_TRI_ENC_V1`), cifrado y con verificación en memoria; SHA-256 `74896516f21b75332f0103e814db028557937db865b5b6ab2e1cfbb16aa9b663` |

## Arquitectura y entrenamiento

La información pública no describe la arquitectura interna. Lo que sí se documenta es el empaquetado: un único fichero `.vcore` de 95.824 bytes que el autor denomina "3-Cores-in-1" y que se carga con verificación de integridad en memoria; el repositorio incluye un manifiesto con SHA-256, latencias y compatibilidad de hardware, una cabecera C11/C++ (`c_abi_header/vivy_micro_edge_abi.h`) para integración nativa en firmware y una matriz de compilación cruzada para ARM64, ARMv7, RISC-V 64 y x86_64. La interfaz es de tipo caja negra: estado proprioceptivo de entrada, consigna de articulaciones a 50 Hz de salida.

Tampoco se especifican los datos de entrenamiento (número de tokens o episodios, composición del dataset, uso de RLHF/DPO). El autor menciona entrenamiento sim-to-real y dos elementos de robustez: tolerancia a holgura de engranajes de ±1° y resistencia a caídas de tensión de batería. El único resultado de evaluación reportado es una tasa de éxito de 8/8 (100 %) en las tareas de sim-to-real declaradas; no se publican métricas de recompensa, tasas de éxito por habilidad ni comparaciones con baselines.

## Capacidades

- Control locomotor a 50 Hz: marcha omnidireccional en terreno irregular con la misma política para cuatro morfologías.
- Recuperación de caídas: levantarse desde posición supina y prona con giro de 180°, y recuperación tras empujón.
- Manipulación básica: recogida de objetos del suelo (ground pick) con el brazo embebido de 6 DoF y golpeo de balón.
- Transiciones posturales: sentarse/levantarse y roulade frontal de 360°.
- Locomoción sobre patines (roller-skate locomotion) como habilidad diferenciada.
- Adaptación morfológica sin cambio de pesos: bipedo de 14 DoF, mini cuadrúpedo de 12 DoF, brazo de 6 DoF y humanoide compacto de 23 DoF.
- Robustez declarada frente a holgura de engranajes (±1°) y caídas de tensión de batería.
- Integración nativa: cabecera C11/C++ y objetivos de compilación cruzada ARM64, ARMv7, RISC-V 64 y x86_64.
- No soporta generación de texto, tool calling, uso de agentes, razonamiento multi-paso ni capacidades multilingües, de visión o de audio.

## Casos de uso

- Robótica educativa de bajo coste: ejecutar el paquete en una Raspberry Pi Zero 2 W (512 MB) o Radxa Zero 3W para enseñar control en tiempo real sin GPU ni robot industrial, usando el script de verificación incluido.
- Bipedo de sobremesa con servos Dynamixel XL330: el perfil `microduck_biped_14dof` (entrada 61, salida 14, 0,0493 ms de media) encaja en un bus Dynamixel de 1 Mbps con 15 servos.
- Robot cuadrúpedo ágil con bus CAN-FD: el perfil `mini_quadruped_12dof` (entrada 48, salida 12, 0,0667 ms) deja margen para el resto del lazo de control en una Pi Zero 2 W.
- Brazo manipulador embebido por UART: el perfil `embedded_arm_6dof` (entrada 28, salida 6, 0,0469 ms) permite integrar la política en firmware de microcontrolador a través de la cabecera C11 y compilación cruzada a ARMv7 o RISC-V.
- Humanoide compacto de investigación: el perfil `compact_humanoid_23dof` (entrada 88, salida 23, 0,1092 ms de media y 0,1451 ms de p99) está pensado para Jetson Orin Nano de 4 GB o RK3588S, dejando 183x de margen sobre el deadline de 20 ms.
- Benchmarking de latencia en pipelines de robótica: el script `run_vivy_micro_edge_research_demo.py` es autónomo y sin dependencias, útil para validar presupuestos de tiempo real en una SBC antes de comprar hardware.
- Pruebas de concepto de sim-to-real: sirve como referencia de política mínima para comparar con políticas de mayor tamaño (por ejemplo, la variante de 3B del mismo autor) en términos de coste computacional y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes de robótica como LIBERO o Meta-World) en la información disponible. Los únicos datos son medidas de latencia y una tasa de éxito sim-to-real del propio autor.

Latencia por morfología (hilo único de CPU, lazo de 50 Hz, según la model card):

| Morfologia | Tensor I/O | Latencia media | p99 | Margen sobre 20 ms |
|---|---|---|---|---|
| `microduck_biped_14dof` | 61 -> 14 | 0,0493 ms | 0,1370 ms | 405,8x |
| `mini_quadruped_12dof` | 48 -> 12 | 0,0667 ms | 0,1515 ms | 300,0x |
| `embedded_arm_6dof` | 28 -> 6 | 0,0469 ms | 0,0989 ms | 426,3x |
| `compact_humanoid_23dof` | 88 -> 23 | 0,1092 ms | 0,1451 ms | 183,1x |

Resumen agregado declarado: 0,0680 ms de media y 0,1592 ms de p99, con tasa de éxito de 8/8 (100 %) en las tareas sim-to-real. No se indica la placa concreta ni la versión de compilador con la que se obtuvieron estas cifras, por lo que no son reproducibles a partir de la información publicada.

## Requisitos de hardware

- VRAM: 0 bytes. El modelo no requiere GPU; se ejecuta en CPU de un solo hilo.
- RAM: 98.388 bytes (96,08 KB) de huella activa; 95.824 bytes en disco. Cabe en caché L2 de SBC de gama baja.
- Placas validadas según el autor: Radxa Zero 3W (RK3566, 1 GB), Raspberry Pi Zero 2 W (512 MB), Milk-V Duo S (RISC-V, 512 MB), NVIDIA Jetson Orin Nano (4 GB) y RK3588S. Rango declarado de 512 MB a 1 GB de RAM.
- GPU recomendadas: ninguna. No se documenta soporte CUDA ni aceleración por GPU.
- Opciones de despliegue: librería `vivy-core`, cabecera C11/C++ `vivy_micro_edge_abi.h` y compilación cruzada a ARM64, ARMv7, RISC-V 64 y x86_64. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un artefacto de este tipo).
- Latencia y throughput: hasta 50 ticks por segundo con 0,0680 ms de media y 0,1592 ms de p99 por tick; no se publica throughput en lote ni consumo energético.

## Comparativa con modelos similares

La información disponible solo permite comparar con otros artefactos del mismo autor. No hay datos públicos de terceros que permitan una comparación rigurosa.

| Modelo | Parametros | Contexto / interfaz | Licencia | Formato | Descargas en HF |
|---|---|---|---|---|---|
| `Vivy-R-Robotics-Micro-Edge` | 24.597 | Tensorial, 28-88 entradas / 6-23 salidas | `vcesl-1.0-commercial-enterprise` | `.vcore` cifrado | 0 |
| `Vivy-R-Robotics-3B-GGUF` | ~3B (según el nombre del repositorio) | No disponible | No disponible | GGUF | 133 |
| `Vivy-R-Vision-3B-GGUF` | ~3B (según el nombre del repositorio) | No disponible; orientado a síntesis de escenas y resolución de restricciones cinemáticas | No disponible | GGUF | No disponible |

Frente a la variante de 3B del mismo autor, la edición Micro-Edge es aproximadamente 123.170x más pequeña en parámetros y prescinde de GPU, a costa de limitarse a control articular de baja dimensión en lugar de tareas generativas. Para políticas de robótica de propósito general de otros autores no se han encontrado datos en la información proporcionada: no disponible.

## Limitaciones y advertencias

- Pesos cifrados y no abiertos: el autor declara `open_source_weights = False`. No es posible reentrenar, hacer fine-tuning, auditar la política ni extraerla del contenedor `.vcore`.
- Arquitectura no documentada: sin topología, función de pérdida ni datos de entrenamiento, la evaluación independiente se limita a medir latencia y comportamiento de caja negra.
- Sin benchmarks estándar: la única métrica de éxito (8/8) es autodeclarada y no se especifica el protocolo, el simulador ni las condiciones de la transferencia sim-to-real.
- Dependencia de la librería `vivy-core`: el formato propietario ata el despliegue al runtime del autor; no hay exportación a ONNX, GGUF ni TensorRT documentada.
- Riesgo en producción: una tasa de éxito del 100 % en ocho tareas no cubre la variabilidad de terreno, carga útil, desgaste de servos ni fallos de bus; el p99 de 0,1592 ms es bajo, pero se desconoce el peor caso en placas distintas de las declaradas.
- Sin capacidades de lenguaje: no sirve para interfaces conversacionales, planificación de alto nivel ni interpretación de instrucciones; requiere un planificador externo.
- Licencia restrictiva: `vcesl-1.0-commercial-enterprise` es una licencia propia del autor (campo `license: other`); conviene revisar el texto completo antes de cualquier uso comercial, distribución en producto o despliegue en flota.
- Madurez baja: 0 descargas y 0 likes en el momento de la consulta, con una única actualización a los diez minutos de la creación del repositorio; no hay evidencia de uso independiente.
- Sesgos: no disponibles. Al ser una política numérica no hay sesgos lingüísticos, pero sí posibles sesgos de dominio derivados de la distribución de simulación empleada, que no se detalla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vinguyen0891/Vivy-R-Robotics-Micro-Edge
- Variante de robótica de 3B del mismo autor: https://huggingface.co/vinguyen0891/Vivy-R-Robotics-3B-GGUF
- Variante de visión de 3B del mismo autor: https://huggingface.co/vinguyen0891/Vivy-R-Vision-3B-GGUF
- Ficha de terceros sobre Vivy R Robotics 3B GGUF: https://free2aitools.com/model/vinguyen0891/vivy-r-robotics-3b-gguf
- Listado de modelos con la etiqueta `autopoietic-harness` (familia Vivy): https://huggingface.co/models?other=autopoietic-harness
- Edge AI Model Zoo de Texas Instruments (referencia de despliegue edge, no relacionado): https://github.com/TexasInstruments/edgeai-modelzoo
- Physical AI Studio de Open Edge Platform (referencia de entrenamiento y despliegue de políticas, no relacionado): https://github.com/open-edge-platform/physical-ai-studio
