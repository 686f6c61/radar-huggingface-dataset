# spst01/Qwen2.5-0.5B-Sukshma

## Resumen

Qwen2.5-0.5B-Sukshma es un artefacto de despliegue en el borde (edge AI) publicado por el usuario spst01 bajo la marca Sovereign Byte Technology. No es un modelo entrenado desde cero ni un fine-tuning: se trata de una recompresión del checkpoint oficial Qwen/Qwen2.5-0.5B-Instruct, empaquetado en un contenedor binario propietario con extensión .sukshma. El autor declara 494,0 millones de parámetros comprimidos en 233,25 MB, lo que supone una reducción física de 4,04x (75,25 % de ahorro) respecto al checkpoint declarado como referencia (942,32 MB).

El problema que aborda es el de la inferencia en dispositivos con memoria muy limitada: teléfonos móviles, Linux embebido, drones y equipos Apple Silicon. La model card afirma una huella de RAM residente de aproximadamente 480 MB frente a los ~1,9 GB del checkpoint original, y una latencia de proyección de matrices de 66,86 µs frente a 183,88 µs (2,75x más rápido). Todo ello se apoya en dos componentes propietarios del autor, SSDC (Sovereign Sub-Byte Discrete Compression) y Adaptive Salient Feature Preservation, de los que no se publica especificación técnica ni artículo.

La relevancia del proyecto es limitada y debe contextualizarse: el repositorio acumula 0 descargas y 0 me gusta en el momento de la consulta, el formato es incompatible con el ecosistema estándar (transformers, vLLM, llama.cpp, Ollama, TGI) y las cifras de rendimiento proceden exclusivamente del propio autor, sin evaluación independiente ni benchmarks de calidad lingüística.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2, heredada del modelo base; el repositorio no documenta modificaciones estructurales |
| Parámetros totales | 494,0 M (según el autor) |
| Parámetros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No especificada en el repositorio. El modelo base Qwen2.5-0.5B-Instruct declara 32.768 tokens nativos (hasta 131.072 con YaRN) según la documentación de Qwen |
| Tipos de cuantización | Contenedor propietario .sukshma (SSDC). No se ofrecen variantes GGUF, AWQ, GPTQ, bitsandbytes ni FP8 |
| Idiomas soportados | No disponibles (no declarados en el repositorio) |
| Licencia | apache-2.0 para los pesos base de Alibaba Qwen; el tooling de contenedorización es de Sovereign Byte Technology, que ofrece licencia comercial aparte |
| Formato de pesos | Binario .sukshma (magic number 0x53554B53, "SUKS"). El repositorio no incluye safetensors ni GGUF |
| Tamaño del repositorio | 0,2 GB |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |

## Arquitectura y entrenamiento

El artefacto preserva la arquitectura del modelo base: un transformer decoder-only de la familia Qwen2 con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA). El repositorio no documenta ningún reentrenamiento, fine-tuning, RLHF ni DPO adicional: la intervención del autor se limita a la compresión y al empaquetado del checkpoint.

La innovación declarada es el contenedor .sukshma, construido sobre dos técnicas propietarias: Sovereign Sub-Byte Discrete Compression (SSDC) y Adaptive Salient Feature Preservation. Según el autor, el resultado mantiene una fidelidad coseno media de capa del 90,96 % respecto al checkpoint de referencia y ejecuta las proyecciones matriciales mediante "low-power integer execution", lo que reduciría el consumo energético alrededor de un 60 %. No se publica ni el algoritmo de cuantización, ni la granularidad de bits, ni el esquema de calibración, ni los pesos por capa, por lo que estas cifras no son reproducibles ni auditables con la información disponible. Tampoco se documenta qué capas se han preservado con mayor precisión y cuáles se han degradado más.

El runner incluido (sukshma_runner.py) es un script independiente sin dependencias que permite inspeccionar metadatos, ejecutar un benchmark de proyección de capas y verificar la reconstrucción de tensores. La model card no demuestra en ningún momento una generación autorregresiva completa de texto, sino operaciones a nivel de capa y de tensor.

## Capacidades

- Generación de texto y conversación: capacidades heredadas de Qwen2.5-0.5B-Instruct, un modelo instruct ajustado para diálogo multi-turno. El repositorio no aporta ninguna evaluación propia de estas capacidades tras la compresión.
- Razonamiento básico y matemáticas elementales: el modelo base de 0,5B resuelve operaciones simples, pero su techo en razonamiento multi-paso es bajo.
- Generación de código: soporte limitado a fragmentos cortos y patrones comunes, propio de un modelo de 0,5B parámetros.
- Tool calling / function calling: el modelo base Qwen2.5-Instruct incorpora plantillas para llamada a herramientas, aunque el repositorio Sūkshma no documenta ni valida esta ruta.
- Capacidades multilingües: no declaradas en el repositorio. El modelo base cubre decenas de idiomas, pero la ficha de Sūkshma no especifica ninguno.
- Ejecución en navegador: incluye browser_demo.html para ejecución cliente-side mediante WebAssembly, con verificación del contenedor en el navegador (Chrome, Safari, Firefox, Edge, Mobile Safari).
- Carga selectiva de tensores: el SDK permite descomprimir una capa concreta en memoria (`model.load_tensor(...)`), lo que habilita cargas parciales en dispositivos con RAM muy ajustada.
- Modo "thinking" y decodificación especulativa: no disponibles.
- Visión, audio o multimodalidad: no disponibles.

## Casos de uso

- Asistentes de texto embebidos en aplicaciones móviles: con 233,25 MB en disco y ~480 MB de RAM declarada, el contenedor puede distribuirse dentro de la propia app (Android, iOS) y funcionar sin conexión, evitando costes de API y manteniendo los datos en el dispositivo.
- Inferencia en navegador sin servidor: el archivo browser_demo.html permite ejecutar el modelo íntegramente en el cliente mediante WebAssembly, útil para demos, formularios con resumen local o funciones de autocompletado que no pueden enviar datos a un backend por requisitos de privacidad.
- Robótica y drones con Linux embebido: el perfil de consumo energético declarado (~60 % menos de drenaje) y la ejecución en enteros lo orientan a plataformas con batería y disipación limitadas, donde interesa clasificar intenciones, generar comandos en lenguaje natural o resumir telemetría localmente.
- Procesamiento de texto en el borde para IoT industrial: etiquetado, normalización o extracción de campos de mensajes cortos en gateways con pocos recursos, siempre que se acepte la pérdida de fidelidad del 9,04 % declarada.
- Prototipado rápido y docencia: el runner sin dependencias permite inspeccionar el desglose de tensores de un transformer real y estudiar el efecto de la compresión sobre las matrices de proyección en un entorno controlado, sin necesidad de GPU.
- Aplicaciones de privacidad estricta (sanidad, legal, sector público): al no requerir red, el modelo encaja en escenarios donde la normativa impide enviar texto a servicios externos, a cambio de asumir una calidad de generación propia de un modelo de 0,5B.
- Pruebas de integración de pipelines de compresión: sirve como banco de pruebas para medir latencia de proyección de capas en Apple Silicon M1 y comparar la sobrecarga de descompresión frente al checkpoint estándar.
- Filtrado y clasificación de baja latencia en el borde: tareas de decisión simple (spam, intención, sentimiento) donde la latencia de 66,86 µs por proyección declarada es más relevante que la fluidez del texto generado.

## Benchmarks y rendimiento

Los únicos datos disponibles son los publicados por el propio autor en la model card, medidos en un Apple Silicon M1 y referidos a métricas de sistema, no a calidad del modelo:

| Métrica | SafeTensors oficial (declarado) | Sūkshma (.sukshma) | Ventaja declarada |
|---|---|---|---|
| Huella física en disco | 942,32 MB | 233,25 MB | 4,04x menor (75,25 % de ahorro) |
| RAM activa en móvil | ~1,9 GB residente | ~480 MB residente | Ejecutable en móvil, Linux embebido y drones |
| Fidelidad coseno media por capa | 100,0 % (FP32) | 90,96 % | Preservación semántica declarada como "excepcional" |
| Latencia de proyección matricial | 183,88 µs | 66,86 µs | 2,75x más rápido |
| Throughput en el borde | 5.438 layer-ops/s | 14.956 layer-ops/s | Ejecución ALU optimizada para hardware |
| Consumo energético | Carga FMA estándar | Ejecución entera de bajo consumo | ~60 % menos de batería |

No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, HumanEval, perplejidad, MT-Bench) en la información disponible, ni para el contenedor .sukshma ni como comparación con el checkpoint original, por lo que no es posible cuantificar el impacto real de la compresión sobre la calidad de las respuestas. Los resultados de la búsqueda web realizada no contienen ninguna referencia técnica al modelo.

## Requisitos de hardware

- VRAM/RAM para inferencia: aproximadamente 480 MB de RAM residente según el autor, frente a ~1,9 GB del checkpoint sin comprimir. No se especifica el consumo de VRAM en GPU dedicada.
- Almacenamiento: 233,25 MB para el contenedor .sukshma, dentro de un repositorio de 0,2 GB.
- GPU recomendadas: no disponibles. El benchmark publicado se realizó en CPU Apple Silicon M1, no en GPU.
- GPU de consumo: no hay datos. Por el tamaño declarado, el modelo cabría con holgura en cualquier GPU consumer (RTX 3060, RTX 4090, etc.), pero el repositorio no documenta ni soporta una ruta CUDA.
- Hardware objetivo declarado: teléfonos móviles, Linux embebido, drones y Apple Silicon (M1).
- Opciones de despliegue: sukshma_runner.py (script Python sin dependencias, con modos inspect, benchmark y verify) y browser_demo.html para ejecución WebAssembly en navegador. No hay integración con vLLM, llama.cpp, Ollama, TGI, TensorRT-LLM ni transformers; usarlos exigiría convertir previamente el contenedor a un formato estándar, tarea para la que no se ofrece herramienta en el repositorio.
- Latencia y throughput estimados: 66,86 µs por proyección matricial y 14.956 layer-ops/s en M1, según medición del autor.
- Requisitos de software: Python 3 para el runner; navegador moderno para la demo WASM. Sin dependencias declaradas.

## Comparativa con modelos similares

No se dispone de benchmarks comunes que permitan comparar la calidad de salida. La comparación se limita a formato, huella y compatibilidad:

| Modelo | Parámetros | Contexto | Formato | Tamaño declarado | Runtimes soportados | Licencia |
|---|---|---|---|---|---|---|
| Qwen2.5-0.5B-Sukshma (spst01) | 494,0 M | No especificado en el repositorio | .sukshma propietario | 233,25 MB | sukshma_runner.py, WASM | apache-2.0 (base) + tooling propietario |
| Qwen2.5-0.5B-Instruct (Alibaba Qwen) | 494,0 M | 32.768 tokens nativos (131.072 con YaRN) | safetensors (BF16/FP16) | 942,32 MB según el autor | transformers, vLLM, llama.cpp, Ollama, TGI | apache-2.0 |
| Qwen2.5-1.5B-Instruct (Alibaba Qwen) | 1.540 M | 32.768 tokens nativos | safetensors | No disponible en la información proporcionada | transformers, vLLM, llama.cpp, Ollama, TGI | apache-2.0 |
| Cuantizaciones GGUF del modelo base (Q4_K_M y similares) | 494,0 M | Heredado del base (32.768 tokens) | GGUF | No disponible en la información proporcionada | llama.cpp, Ollama, LM Studio | apache-2.0 |

Frente a una cuantización GGUF del mismo modelo base, el contenedor .sukshma ofrece una huella de disco comparable o algo menor, pero pierde por completo la interoperabilidad con el ecosistema. Frente al checkpoint oficial, gana en tamaño y pierde en fidelidad de pesos. No hay datos públicos que permitan afirmar que la pérdida de calidad sea menor que la de una cuantización convencional de 4 bits.

## Limitaciones y advertencias

- Validación comunitaria inexistente: 0 descargas y 0 me gusta en el momento de la consulta, sin evaluaciones de terceros ni issues públicos que respalden las cifras declaradas.
- Fidelidad degradada: el propio autor reconoce una fidelidad coseno media del 90,96 %, lo que implica una pérdida de señal del 9,04 % por capa. No se publica ningún benchmark de perplejidad, MMLU o generación que traduzca esa pérdida a calidad de respuesta.
- Inconsistencia en las cifras de referencia: la model card describe los 942,32 MB del checkpoint oficial como "SafeTensors FP32", pero 494 M de parámetros en FP32 ocuparían cerca de 1,98 GB. La cifra corresponde más bien a un checkpoint en BF16/FP16, lo que resta fiabilidad al resto de números.
- Formato cerrado y dependencia del proveedor: el contenedor .sukshma solo se lee con el runner del autor. No hay convertidor a safetensors, GGUF ni a ningún otro formato estándar, lo que crea un riesgo de dependencia y de discontinuidad si el proyecto se abandona.
- Ausencia de especificación técnica: SSDC y Adaptive Salient Feature Preservation no están documentados en ningún artículo, informe o repositorio público, por lo que no pueden auditarse ni reproducirse.
- Ruta de generación no demostrada: los ejemplos de la model card cubren inspección de metadatos, benchmark de proyección de capas y verificación de tensores, pero no una generación autorregresiva completa de texto.
- Rendimiento declarado no verificado: las cifras de 2,75x de speedup y ~60 % de ahorro energético proceden de mediciones del propio autor en un único equipo (Apple Silicon M1), sin metodología publicada.
- Idiomas no declarados: la ficha no especifica qué idiomas cubre el artefacto. El modelo base es multilingüe, pero no hay confirmación de que la compresión preserve el comportamiento en todas las lenguas.
- Modelo base de capacidad limitada: con 0,5B parámetros, Qwen2.5-0.5B-Instruct tiene una tasa de alucinación alta en tareas abiertas y un razonamiento multi-paso débil. La compresión no mejora estas limitaciones y puede agravarlas.
- Sesgos heredados: al no haber reentrenamiento, el artefacto arrastra los sesgos del checkpoint original de Alibaba Qwen, no evaluados en esta ficha.
- Licencia y uso comercial: los pesos base son apache-2.0, pero la model card remite a un correo de contacto para "licencia comercial y despliegue empresarial del contenedor". Conviene aclarar por escrito qué cubre esa licencia adicional antes de un uso productivo, ya que el tooling de compresión es propiedad de Sovereign Byte Technology.
- Fechas del repositorio: los metadatos indican creación el 15/09/2026, dato que dificulta reconstruir el historial del artefacto.
- Búsqueda web sin resultados útiles: las consultas realizadas devolvieron exclusivamente páginas de un portal de citas, sin ninguna referencia técnica al modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/spst01/Qwen2.5-0.5B-Sukshma
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Contacto comercial declarado por el autor: sovereignbyte.tech@gmail.com
- Artículo técnico de SSDC o Adaptive Salient Feature Preservation: no disponible
- Repositorio de código del runner más allá del script incluido: no disponible
- Demo pública alojada: no disponible (solo el archivo browser_demo.html del repositorio)
- Referencias técnicas adicionales en la búsqueda web: no disponibles
