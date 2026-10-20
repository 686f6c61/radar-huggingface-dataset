# Thingamatronics/Sable_v19_ctx32k-q4f32_1-MLC

## Resumen

Sable_v19_ctx32k-q4f32_1-MLC es un conjunto de pesos compilados con MLC-LLM para el modelo Qwen2.5-1.5B-Instruct, afinado por el usuario Thingamatronics para interpretar a un personaje concreto ("Dr. Sable") dentro de una demo jugable en navegador. No se distribuye como asistente de propósito general: el repositorio contiene únicamente los pesos en formato MLC, que WebLLM descarga en tiempo de ejecución y ejecuta íntegramente en el navegador del usuario mediante WebGPU, sin enviar nada a un servidor.

El modelo hereda la arquitectura y el tamaño del base: 1.500 millones de parámetros, contexto declarado de 32.768 tokens y licencia Apache-2.0. La cuantización aplicada es `q4f32_1-MLC`, el esquema de compilación de MLC-LLM, con un peso de descarga de aproximadamente 880 MB y un consumo de memoria de GPU estimado en ~3,3 GB en f32 y ~2,5 GB en f16.

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de cómo empaquetar un modelo afinado para un personaje y desplegarlo en el cliente con WebLLM, un patrón útil para demos, prototipos de videojuegos y experimentos de inferencia local en el navegador. No es un modelo validado para producción ni dispone de benchmarks publicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | ~1.500 millones (1.5B, segun el modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | `q4f32_1-MLC` (compilacion MLC-LLM); el repositorio solo incluye esta variante |
| Idiomas soportados | no disponible (la model card no lo declara) |
| Licencia | Apache-2.0 |
| Formato de pesos | Pesos compilados de MLC-LLM (formato propio, cargable por WebLLM); no incluye safetensors ni GGUF |

Datos adicionales aportados por el autor: tamano del repositorio 0,9 GB, descarga ~880 MB, memoria de GPU ~3,3 GB (f32) / ~2,5 GB (f16).

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only con atención completa, del que este repositorio no documenta ni el número de capas, ni las dimensiones ocultas, ni la configuración de cabezas. Sobre esa base se ha realizado un ajuste fino orientado a un personaje único de un videojuego; el autor no publica detalles del dataset, del número de tokens de entrenamiento, ni de si se emplearon técnicas de alineación adicionales como RLHF o DPO. Tampoco se especifica si el ajuste se hizo sobre la variante Instruct completa o sobre un subconjunto de capas.

La innovación técnica aquí no está en el modelo, sino en el pipeline de despliegue: los pesos se compilan con MLC-LLM al esquema `q4f32_1-MLC`, que cuantiza los pesos a 4 bits manteniendo acumulación en f32, y se sirven a WebLLM para su ejecución sobre WebGPU en el navegador del cliente. Ese enfoque elimina el servidor de inferencia y la latencia de red, a cambio de depender del hardware gráfico del usuario y de un tiempo de descarga inicial de ~880 MB.

## Capacidades

- Generación de texto conversacional multi-turno en el papel de un personaje concreto ("Dr. Sable"), condicionada por el motor del juego.
- Ventana de contexto de 32.768 tokens, suficiente para mantener el historial de una partida y el estado narrativo dentro del prompt.
- Inferencia local en el navegador mediante WebLLM y WebGPU, sin backend ni llamadas a API.
- Capacidades heredadas del base Qwen2.5-1.5B-Instruct (comprensión lectora básica, generación de texto, matemáticas simples y código), aunque no están documentadas ni evaluadas para este ajuste.
- Soporte de tool calling / function calling: no disponible en la información proporcionada para este ajuste.
- Capacidades de agente y razonamiento multi-paso: no disponibles ni declaradas por el autor; el modelo está diseñado para un rol acotado.
- Multilingüismo: no disponible; la model card no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- NPC conversacional en un videojuego web: el motor del juego inyecta el estado de la partida en el prompt y el modelo genera los diálogos del personaje; encaja porque se ejecuta en el cliente sin coste de servidor y con contexto suficiente para arrastrar el historial de la sesión.
- Demo técnica de WebGPU/WebLLM: sirve como referencia reproducible para medir tiempos de descarga, consumo de VRAM y latencia de decodificación en GPUs de escritorio, partiendo de los ~880 MB de pesos y ~2,5-3,3 GB de memoria indicados.
- Prototipado de personajes antes de invertir en infraestructura: permite validar guiones, tono y flujo conversacional con un modelo de 1.5B afinado, sin desplegar servidores ni endpoints.
- Aplicaciones offline o con requisitos de privacidad estrictos: al no salir los datos del navegador, es adecuado para demos educativas o实验 de investigación donde no se quiere enviar texto del usuario a un tercero.
- Investigación sobre fine-tuning de rol y evaluación de Deriva de personaje: útil para estudiar cómo un ajuste pequeño sobre un modelo de 1.5B degrada o preserva capacidades generales, comparándolo contra el base Qwen2.5-1.5B-Instruct.
- Pruebas de integración de inferencia en el navegador dentro de pipelines de CI: automatizar la carga del modelo con WebLLM en un navegador headless con WebGPU para detectar regresiones de compatibilidad o de memoria.
- Docencia sobre despliegue de modelos: ejemplo compacto de cuantización 4 bits, compilación MLC y ejecución cliente-side, con un tamaño manejable para aulas y talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas del personaje, ni latencia o throughput medidos. Tampoco hay datos de evaluación propios del ajuste fino.

## Requisitos de hardware

- VRAM estimada: ~3,3 GB en f32 y ~2,5 GB en f16, según la model card; hay que sumar el overhead del navegador y del contexto WebGPU.
- GPU recomendadas: cualquier GPU de escritorio o portátil con soporte de WebGPU (gama alta y media de AMD, NVIDIA e Intel, y Apple Silicon). No se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, siempre que el navegador exponga WebGPU y la GPU tenga al menos ~3-4 GB disponibles; el autor indica explícitamente que móviles y tablets no pueden ejecutarlo.
- Despliegue: WebLLM sobre WebGPU es la vía prevista. MLC-LLM permite compilar y servir el modelo en otras plataformas, pero este repositorio solo contiene los artefactos para WebLLM. vLLM, llama.cpp, Ollama y TGI no son compatibles directamente con el formato de pesos incluido.
- Almacenamiento y red: ~880 MB de descarga inicial, con caché posterior en el navegador (Cache API/IndexedDB, según implementación de WebLLM).
- Latencia y throughput: no disponibles; dependerán de la GPU del cliente y del tamaño de contexto utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Sable_v19_ctx32k-q4f32_1-MLC | ~1.5B | 32.768 | Apache-2.0 | Pesos MLC para WebLLM | Afinado para un personaje; sin benchmarks publicados |
| Qwen2.5-1.5B-Instruct (base) | ~1.5B | 32.768 | Apache-2.0 | Safetensors, GGUF y otras variantes en HuggingFace | Modelo generalista; sirve de referencia para medir la Deriva introducida por el ajuste |
| Qwen2.5-0.5B-Instruct | ~0.5B | 32.768 | Apache-2.0 | Multiples formatos | Alternativa más ligera para entornos con menos memoria; menor calidad esperada |
| Modelos de ~1-2B con soporte WebLLM (por ejemplo, variantes compiladas de Llama 3.2 1B o SmolLM2) | 1-2B | Variable según modelo | Licencias dispares (Llama, Apache-2.0) | Pesos MLC publicados por la comunidad | Alternativas para despliegue en navegador; requieren verificar la compilación MLC disponible |

Los datos de los modelos alternativos provienen de sus fichas públicas y deben verificarse antes de tomar una decisión; no se dispone de comparaciones de rendimiento directas con este ajuste.

## Limitaciones y advertencias

- No es un asistente de propósito general: el autor lo declara explícitamente. Está afinado para un personaje y un juego concretos, y el motor del juego, no el modelo, determina qué es cierto en cada partida.
- Riesgo de alucinación y de inconsistencia narrativa: con 1.5B parámetros y un ajuste estrecho, es esperable que invente detalles fuera del guion o pierda coherencia en contextos largos.
- Deriva de capacidades: el ajuste fino sobre un modelo pequeño puede degradar el rendimiento en tareas generales (matemáticas, código, razonamiento) respecto al base Qwen2.5-1.5B-Instruct; no hay evaluación que lo cuantifique.
- Idiomas: no declarados. No se puede asumir un rendimiento multilingüe correcto sin pruebas.
- Compatibilidad: solo funciona en navegadores con WebGPU sobre escritorio o portátil; móviles y tablets quedan excluidos según el autor. Tampoco es cargable con llama.cpp, Ollama, vLLM o TGI en su formato actual.
- Coste de entrada: ~880 MB de descarga y ~2,5-3,3 GB de memoria gráfica, más el overhead del navegador; en GPUs integradas puede provocar caídas de frames o fallos de contexto.
- Licencia: Apache-2.0 permite uso comercial y modificaciones, pero se heredan las obligaciones de atribución y las condiciones del modelo base Qwen2.5-1.5B-Instruct; conviene revisar ambas.
- Señales de validación débiles: el repositorio registra 0 descargas y 0 likes, sin benchmarks ni evaluación independiente. No se recomienda su uso en producción sin una batería de pruebas propia.
- Los resultados de búsqueda web asociados a esta consulta no contenían información técnica utilizable sobre el modelo, por lo que no se han incorporado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Thingamatronics/Sable_v19_ctx32k-q4f32_1-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- WebLLM (repositorio): https://github.com/mlc-ai/web-llm
- Demo jugable "Dr. Sable": https://stickybitgames.itch.io/doctor-sable
- MLC-LLM (herramienta de compilación): https://github.com/mlc-ai/mlc-llm
- Documentación de MLC-LLM: https://llm.mlc.ai/docs/
- Página del autor en HuggingFace: https://huggingface.co/Thingamatronics
