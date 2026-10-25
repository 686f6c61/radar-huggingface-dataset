# Tomoali/d1-3B-ryzen-ai-npu

## Resumen

Tomoali/d1-3B-ryzen-ai-npu es una conversión no oficial de LiquidAI/d1-3B (un modelo de decisión de 3B parámetros de la familia LFM2, con codificador visual SigLIP2) para que tanto el decodificador de lenguaje como el codificador de visión se ejecuten en la NPU XDNA 2 de los procesadores AMD Ryzen AI 300 mediante ONNX Runtime y el stack Ryzen AI Software 1.8.0. d1 no genera tokens: en un único forward pass responde preguntas tipadas (sí/no, elección entre opciones, puntuación) sobre un estado de texto más una imagen y devuelve probabilidades. Esa naturaleza discriminativa es lo que lo hace interesante para automatización de interfaz y agentes que necesitan decidir rápido en lugar de redactar.

El interés del artefacto es de despliegue, no de modelado: demuestra que un modelo visión-lenguaje de 3B puede correr íntegramente en la NPU integrada de un portátil con Windows 11, liberando la GPU y la CPU. El autor reporta 3,51 respuestas por segundo con un consumo de unos 1,1 J por respuesta en un Ryzen AI 7 PRO 350, frente a 2,45 respuestas por segundo y 3,6 J con llama.cpp sobre Vulkan en la misma máquina.

La conversión es experimental y con alcance muy acotado: entrada visual fija de 640x400, prompts de hasta 4096 tokens, cuantización de 4 bits en el decodificador, licencia LFM Open License v1.0 y soporte únicamente en inglés y japonés. No sustituye al modelo original para generación de texto libre.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de decisión visión-lenguaje (image-text-to-text) basado en la familia LFM2; etiquetas `lfm2`, `lfm2_vl`. La model card no detalla la arquitectura interna (capas, atención, convoluciones) |
| Parámetros totales | 3B (según el nombre del modelo y el modelo base LiquidAI/d1-3B) |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | Prompts de hasta 4096 tokens en el decodificador convertido para NPU |
| Tipos de cuantización | Decodificador en 4 bits (`model_generate --npu --basic`); codificador visual y proyector en bf16; embeddings de tokens en 4 bits |
| Idiomas soportados | Inglés (en) y japonés (ja) |
| Licencia | LFM Open License v1.0 (`lfm1.0`); uso comercial no licenciado para entidades con ingresos anuales de 10 millones de USD o más |
| Formato de pesos | ONNX para ONNX Runtime (ejecución NPU con `RyzenAILightExecutionProvider` y `VitisAIExecutionProvider`); requiere `custom_code` |
| Tamaño de los pesos | Aproximadamente 3,5 GB (repositorio de 3,7 GB) |
| Entrada visual | 640x400 fijos (parches de 24x40) en el codificador SigLIP2; el runtime estira cualquier imagen a ese tamaño |
| Salida | Probabilidades para sí/no, elección entre opciones y puntuación; sin generación autorregresiva de tokens |
| Plataforma | Windows 11, AMD Ryzen AI 300 (XDNA 2), driver NPU, Ryzen AI Software 1.8.0 |

## Arquitectura y entrenamiento

El paquete contiene tres componentes: `language/` (decodificador de 4 bits convertido para NPU, con prompts de hasta 4096 tokens), `vision/` (codificador SigLIP2 más proyector en bf16 sobre `VitisAIExecutionProvider`, con entrada fija de 640x400 y compilación en el primer uso que tarda unos 10 minutos y queda cacheada) y `embed/` (embeddings de tokens de 4 bits que se ejecutan en CPU). El conjunto ocupa unos 3,5 GB. El autor no publica detalles de la arquitectura interna ni del proceso de conversión más allá del comando utilizado.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni sobre el proceso de ajuste que convierte el modelo base en un modelo de decisión. Tampoco se documentan innovaciones de decodificación: por diseño, d1 evalúa opciones en un único forward pass y devuelve probabilidades, de modo que no aplica decodificación especulativa ni generación token a token. La conversión es no oficial y no está respaldada por AMD ni por Liquid AI (ver `NOTICE.md` del repositorio).

## Capacidades

- Evaluación de estados de pantalla: responde preguntas de sí/no, elección múltiple y puntuación sobre una captura de pantalla más un texto de contexto (por ejemplo, "¿está el formulario enviado?").
- Salida probabilística calibrable: en lugar de texto libre, devuelve probabilidades que el llamante puede umbralizar con presets (el autor incluye un preset con umbrales afinados para preguntas de estado de navegador).
- Procesamiento conjunto de texto e imagen en un solo paso, sin generación autorregresiva, lo que reduce la latencia frente a esquemas de prompting generativo.
- Ejecución íntegra en NPU para el decodificador y el codificador visual, dejando CPU y GPU libres (el autor mide uso de CPU sin cambios respecto al reposo).
- Soporte multilingüe limitado a inglés y japonés.
- Encaje en bucles de control de agentes: puede actuar como clasificador de estado entre acciones dentro de una política mayor.
- No soporta tool calling, function calling, razonamiento multi-paso autónomo ni generación de código, matemáticas o texto libre: la tarea está restringida a decidir sobre opciones predefinidas.

## Casos de uso

- Automatización de navegador como clasificador de estado: entre acción y acción, el modelo responde si la página está cargada, si hay un diálogo modal o si el envío se completó; con 95,8% de acierto reportado en preguntas de estado de pantalla con el preset ajustado, es viable como comprobador, no como planificador.
- Control de calidad de formularios en escritorio: dado un texto de contexto y una captura, decidir sí/no sobre condiciones verificables (campo vacío, error visible, botón deshabilitado) con umbral de probabilidad configurable.
- Monitorización de estado en estaciones de trabajo sin GPU: al ejecutarse en la NPU con ~1,1 J por respuesta, permite bucles de comprobación continua (cada pocos cientos de milisegundos) en portátiles con batería.
- Triaje de capturas para pipelines de datos: filtrar lotes de 100 capturas y clasificar cada una mediante preguntas de sí/no antes de pasarlas a un modelo mayor, usando la NPU como primera etapa barata.
- Asistencia a accesibilidad: verificar si una pantalla muestra un mensaje de error o un estado esperado y disparar avisos, con la ventaja de que el cómputo no compite por la GPU con el resto del sistema.
- Validación de contenido visual con puntuación: asignar un score a una imagen respecto a un criterio textual (adecuación, presencia de elementos) y umbralizarlo en un servicio interno.
- Evaluación comparativa de despliegue en NPU: servir como referencia reproducible para medir latencia, consumo y acuerdo frente a la versión fp32 en transformers durante la validación de hardware Ryzen AI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas cifras son mediciones de despliegue del autor en un Ryzen AI 7 PRO 350 (32 GB, driver NPU 32.0.203.329):

| Medición | Resultado |
|---|---|
| Acuerdo con el modelo oficial fp32 (transformers, CPU) en 27 preguntas sobre texto y dos capturas | Misma elección en 27/27; diferencia máxima de probabilidad 0,130 |
| Throughput en ejecución continua de las 27 preguntas releyendo las imágenes | 3,51 respuestas/s; CPU sin incremento respecto al reposo; ~1,1 J por respuesta (contador de potencia de la APU) |
| Referencia en la misma máquina con llama.cpp (Vulkan, GPU) | 2,45 respuestas/s; ~3,6 J por respuesta |
| Preguntas de estado de pantalla sobre 41 capturas no usadas para ajustar el preset (de 100 capturas a 640x400, 10 preguntas) | 77,3% de acierto con redacción simple; 95,8% con el preset del repositorio (elegido sobre las otras 59 capturas) |
| Elección de la siguiente acción entre una lista larga de candidatos de interfaz (replay de un controlador de automatización) | ~40% de elecciones aceptables |

## Requisitos de hardware

- Plataforma obligatoria: procesador AMD Ryzen AI 300 (NPU XDNA 2), Windows 11 y driver de NPU instalado. No hay ruta CUDA ni Apple Silicon documentada para este paquete.
- Software: Ryzen AI Software 1.8.0 (su entorno conda aporta el ONNX Runtime con `RyzenAILightExecutionProvider` y `VitisAIExecutionProvider`) y el paquete de runtime `d1npu` del repositorio de GitHub.
- Memoria: pesos de ~3,5 GB; el sistema medido dispone de 32 GB de memoria compartida. No se publica una cifra mínima de memoria.
- GPU dedicada: no requerida ni utilizada; el modelo está pensado para liberar la GPU. La comparación del autor con llama.cpp sobre Vulkan corresponde a la ejecución del modelo en GPU en la misma máquina, no a este paquete ONNX.
- Despliegue: `python -m d1npu download` y `python -m d1npu screen-check` para el flujo de comprobación de pantalla. Alternativas fuera de este artefacto: transformers con el modelo base oficial o llama.cpp, sin las ventajas de NPU.
- Primer arranque: compilación del grafo visual para NPU de unos 10 minutos, cacheada después.
- Latencia y throughput medidos: 3,51 respuestas/s y ~1,1 J por respuesta en Ryzen AI 7 PRO 350.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Ejecución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tomoali/d1-3B-ryzen-ai-npu | 3B | 4096 tokens de prompt | NPU XDNA 2 (ONNX Runtime, Ryzen AI 1.8.0), Windows 11 | LFM Open License v1.0 (restricción comercial para ingresos ≥ 10 M USD) | HuggingFace + runtime en GitHub; conversión no oficial |
| LiquidAI/d1-3B (oficial) | 3B | No disponible en la información | transformers en fp32 (CPU/GPU); referencia de acuerdo del autor | LFM Open License v1.0 | HuggingFace, mantenido por Liquid AI |
| d1-3B ejecutado con llama.cpp (Vulkan, GPU) | 3B | No disponible en la información | GPU vía Vulkan | LFM Open License v1.0 | Según la medición del autor: 2,45 respuestas/s y ~3,6 J por respuesta |

No se dispone de datos de otros modelos comparables de la misma categoría (clasificadores visión-lenguaje de ~3B para decisión sobre interfaz) en la información proporcionada.

## Limitaciones y advertencias

- Conversión no oficial: no está respaldada por AMD ni por Liquid AI; posibles fallos de compatibilidad con versiones distintas de Ryzen AI Software, drivers o del runtime `d1npu`.
- Solo Windows 11 y Ryzen AI 300 con XDNA 2; no hay soporte para otras NPU, GPU o plataformas Linux documentado.
- Entrada visual rígida de 640x400: el runtime estira cualquier imagen a esa resolución, lo que degrada texto pequeño o interfaces densas.
- Contexto de 4096 tokens: insuficiente para documentos largos o historiales extensos.
- No genera texto: no sirve para respuestas abiertas, código, matemáticas ni razonamiento multi-paso; solo decide entre opciones suministradas.
- Rendimiento limitado en selección entre muchas opciones: ~40% de elecciones aceptables al elegir la siguiente acción en una lista larga de candidatos de interfaz.
- Riesgo de sobreajuste de umbrales: el preset que alcanza 95,8% se ajustó sobre 59 capturas y se evaluó sobre otras 41 del mismo dominio; con redacción simple el acierto cae a 77,3%.
- Calibración dependiente del dominio: las probabilidades pueden diferir hasta 0,130 respecto al fp32 en casos concretos, por lo que los umbrales deben revalidarse en cada aplicación.
- Idiomas: solo inglés y japonés; el rendimiento en castellano no está documentado y no debería asumirse.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o robustez en la model card.
- Licencia: LFM Open License v1.0 restringe el uso comercial a entidades con ingresos anuales inferiores a 10 millones de USD; revisar `LICENSE` antes de integrar en producto.
- Primer uso lento (~10 minutos de compilación del grafo visual); no apto para arranques efímeros sin caché.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tomoali/d1-3B-ryzen-ai-npu
- Repositorio con código, uso y notas de medición: https://github.com/tomhda/d1-3b-ryzen-ai-npu
- Modelo base oficial: https://huggingface.co/LiquidAI/d1-3B
- Documentación de Ryzen AI Software: https://ryzenai.docs.amd.com/
- Licencia LFM Open License v1.0: https://huggingface.co/Tomoali/d1-3B-ryzen-ai-npu/blob/main/LICENSE
