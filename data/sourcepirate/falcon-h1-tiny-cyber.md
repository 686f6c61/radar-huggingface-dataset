# sourcepirate/falcon-h1-tiny-cyber

## Resumen

Falcon-H1-Tiny-Cyber es un ajuste fino por QLoRA del modelo `tiiuae/Falcon-H1-Tiny-R-90M` de TII, publicado por el usuario sourcepirate en Hugging Face. El resultado es un modelo causal de generacion de texto de 91,1 millones de parametros especializado en ciberseguridad ofensiva: pentesting en Linux, analisis de comandos, inteligencia de amenazas y reasoning sobre exploits. Los pesos LoRA estan fusionados en el modelo base, por lo que el repositorio se carga como un transformer estandar sin necesidad de PEFT.

El interes practico del modelo no esta en su rendimiento bruto, sino en su tamano: con unos 91 millones de parametros y un repositorio de 0,3 GB, se puede ejecutar en CPU o en GPUs de gama baja y sirve como banco de pruebas para tareas de seguridad asistidas por modelos pequenos. La model card es inusualmente transparente sobre el proceso de entrenamiento (hiperparametros, datasets, limites), algo poco habitual en ajustes finos de nicho.

No obstante, conviene ser realista: el autor no publica ningun benchmark, el entrenamiento fue de una sola epoca sobre datasets publicos de calidad heterogenea y el modelo base es de tipo "tiny". Es una herramienta de experimentacion y educacion, no un sustituto de un modelo grande para tareas de seguridad en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Falcon-H1 (transformer hibrido, modelo base `tiiuae/Falcon-H1-Tiny-R-90M`) |
| Parametros totales | 91.131.072 (91,1 M) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso secuencias de 1024 tokens) |
| Tipos de cuantizacion | GGUF Q8_0 publicado; el modelo base admite cuantizaciones adicionales via llama.cpp, no verificadas en este repo |
| Idiomas soportados | ingles (en) |
| Licencia | falcon-llm-license (heredada del modelo base; ver enlace) |
| Formato de pesos | safetensors (bf16, pesos fusionados) y GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo parte de Falcon-H1-Tiny-R-90M, un transformer de la familia Falcon-H1 de TII con 91,1 M de parametros. El ajuste se realizo con QLoRA sobre una base cuantizada a 4 bits, con LoRA de rango 8, alpha 16 y dropout 0,05, aplicado a `q_proj`, `k_proj`, `v_proj`, `o_proj`, `in_proj`, `gate_proj`, `up_proj` y `down_proj`. Se entreno durante una sola epoca con learning rate 2e-4, batch micro de 1 con acumulacion de gradiente de 8, optimizador `paged_adamw_8bit` y semilla 42. La longitud maxima de secuencia fue de 1024 tokens, descartando (no truncando) las filas mas largas. Los adaptadores se fusionaron en el modelo base, de ahi que el repositorio se cargue como un modelo causal convencional.

Los datos provienen de siete datasets publicos de ciberseguridad: `WNT3D/Ultimate-Offensive-Red-Team` (20.000 filas), `suryanshp1/kali-linux-pentesting-data` (343), `echel0nn1881/kimi-cyber-reasoning` (997), `reloading0101/threat-intelligence-dataset` (6.000), `Waiper/ExploitDB_DataSet` (8.000), `Romit2004/LinuxCommands` (6.000) y `2etatg/Debian_Hacking_Networking` (965). El autor no documenta el numero total de tokens efectivos ni si hubo etapas de RLHF o DPO; la evaluacion se limito a comprobar que la perdida fuera finita (un NaN/inf aborta el entrenamiento). No se declara ninguna innovacion tecnica adicional mas alla del propio ajuste.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat incluida en el tokenizer.
- Generacion de comandos de linea de comandos para Linux y Debian orientados a redes y seguridad (tcpdump, herramientas de pentesting, gestion de red).
- Conocimiento de tecnicas de red team y pentesting derivado de los datasets de entrenamiento.
- Razonamiento basico sobre ciberseguridad (el dataset `kimi-cyber-reasoning` aporta ejemplos de este tipo).
- Resumen y consulta de inteligencia de amenazas a partir del dataset de threat intelligence.
- Referencia a exploits y vulnerabilidades (dataset ExploitDB).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada.
- Capacidades multilingues: solo ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Asistente educativo de pentesting: el modelo puede generar comandos de reconocimiento y explotacion en un entorno de laboratorio controlado, y su tamano permite desplegarlo en un portatil sin GPU dedicada para practicas de formacion.
- Generacion de comandos de red y diagnostico: preguntas del tipo "escribe un comando tcpdump solo para DNS" se resuelven con respuestas cortas y directas, adecuadas para integrarse en un CLI de ayuda interna.
- Enriquecimiento de playbooks de respuesta a incidentes: a partir de descripciones de amenazas, el modelo puede proponer comandos de triaje en Linux, util como borrador que un analista revisa antes de ejecutar.
- Prototipado rapido de un chatbot de seguridad en CPU: con el GGUF Q8_0 y llama.cpp se puede montar una demo local sin Python ni GPU, ideal para validar flujos de producto antes de invertir en modelos mayores.
- Generacion de material de formacion: creación de ejercicios y explicaciones sobre tecnicas de red team a partir de los datasets de entrenamiento, siempre con revision humana.
- Filtro o clasificador auxiliar de consultas: por su bajo coste, puede usarse como primera capa para detectar consultas relacionadas con seguridad y derivarlas a un modelo mayor o a un analista.
- Experimentacion academica sobre ajuste fino: la configuracion QLoRA documentada y el repositorio pequeno lo convierten en una base reproducible para estudiar el efecto de datasets de seguridad en modelos de 90 M de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclaman puntuaciones de benchmark y que la evaluacion se limito a comprobar que la perdida de entrenamiento fuera finita.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,2 GB para los pesos (91,1 M de parametros), mas overhead de activaciones y cache KV; en la practica cabe en cualquier GPU con 1-2 GB libres.
- VRAM estimada con el GGUF Q8_0: en torno a 0,1 GB para los pesos; ejecutable en CPU sin GPU.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien A100/H100, aunque estan sobredimensionadas para este modelo.
- Cabe en GPU consumer: si, en practicamente todas, incluidas GPUs de portatil con poca VRAM.
- Opciones de despliegue: `transformers` con `device_map="auto"`, llama.cpp (`llama-cli`) con el GGUF Q8_0, y potencialmente Ollama o vLLM si se generan los formatos correspondientes (no verificados en el repositorio).
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera una latencia muy baja en CPU y GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sourcepirate/falcon-h1-tiny-cyber | 91,1 M | no disponible | Ciberseguridad ofensiva (QLoRA) | falcon-llm-license | Hugging Face (safetensors + GGUF Q8_0) |
| tiiuae/Falcon-H1-Tiny-R-90M | 90 M | no disponible | Modelo base generalista | falcon-llm-license | Hugging Face |
| Modelos tiny generalistas de la misma escala (p. ej. variantes TinyLlama/Qwen tiny) | ~100 M - 1 B | variable segun modelo | Proposito general | variable | Hugging Face |

La comparacion directa con alternativas especializadas en ciberseguridad de la misma escala no esta disponible: los ajustes finos de seguridad publicos suelen partir de modelos de 7 B o mas. Frente a su modelo base, la unica diferencia medible es el ajuste QLoRA sobre datos de seguridad; no hay benchmarks que cuantifiquen la mejora.

## Limitaciones y advertencias

- No hay benchmarks publicados: no se puede afirmar que el ajuste mejore al modelo base en ninguna tarea medible.
- Entrenamiento de una sola epoca sobre datasets publicos de calidad heterogenea; el riesgo de sobreajuste a formatos concretos y de respuestas incorrectas es alto.
- Riesgo elevado de alucinacion en comandos y referencias a exploits: el modelo puede generar comandos peligrosos o sintacticamente incorrectos; hay que revisar cada salida antes de ejecutarla.
- Ventana de contexto de entrenamiento de solo 1024 tokens (las filas mas largas se descartaron); la longitud de contexto efectiva del modelo base no se documenta.
- Solo ingles: no hay soporte declarado de castellano ni de otros idiomas.
- Restricciones de licencia: hereda la falcon-llm-license del modelo base, que hay que revisar para uso comercial; ademas, el dataset `reloading0101/threat-intelligence-dataset` es CC-BY-NC-SA-4.0 (no comercial), lo que condiciona el uso comercial del modelo entrenado con el.
- Uso previsto limitado a pruebas de seguridad autorizadas, investigacion y educacion; el autor advierte explicitamente contra el uso ofensivo no autorizado.
- Sesgos: no documentados por el autor; al entrenarse solo con datos de seguridad ofensiva, es esperable un sesgo hacia respuestas tecnicas agresivas y poca moderacion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad ni casos de uso reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sourcepirate/falcon-h1-tiny-cyber
- Modelo base: https://huggingface.co/tiiuae/Falcon-H1-Tiny-R-90M
- Licencia Falcon-LLM: https://huggingface.co/tiiuae/falcon-llm-license
- Dataset `WNT3D/Ultimate-Offensive-Red-Team`: https://huggingface.co/datasets/WNT3D/Ultimate-Offensive-Red-Team
- Dataset `suryanshp1/kali-linux-pentesting-data`: https://huggingface.co/datasets/suryanshp1/kali-linux-pentesting-data
- Dataset `echel0nn1881/kimi-cyber-reasoning`: https://huggingface.co/datasets/echel0nn1881/kimi-cyber-reasoning
- Dataset `reloading0101/threat-intelligence-dataset`: https://huggingface.co/datasets/reloading0101/threat-intelligence-dataset
- Dataset `Waiper/ExploitDB_DataSet`: https://huggingface.co/datasets/Waiper/ExploitDB_DataSet
- Dataset `Romit2004/LinuxCommands`: https://huggingface.co/datasets/Romit2004/LinuxCommands
- Dataset `2etatg/Debian_Hacking_Networking`: https://huggingface.co/datasets/2etatg/Debian_Hacking_Networking
