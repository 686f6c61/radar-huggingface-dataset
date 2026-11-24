# webmp3/Sakura-Fara1.5-9B-GGUF

## Resumen
Sakura-Fara1.5-9B-GGUF es una cuantización comunitaria en formato GGUF del modelo microsoft/Fara1.5-9B, un agente de uso de ordenador (computer-use agent) multimodal desarrollado por Microsoft para la navegación web automatizada. El modelo base parte de Qwen3.5-9B y es capaz de leer capturas de pantalla del navegador y emitir llamadas a herramientas estructuradas, lo que lo sitúa en la categoría de modelos orientados a agentes más que a generación de texto convencional. Esta ficha describe la versión cuantizada publicada por el usuario webmp3 bajo la línea Sakura Mini, no la versión oficial de Microsoft.

El interés de esta publicación reside en su método de cuantización: en lugar de aplicar reglas fijas de bits por tensor, el autor asigna el presupuesto de bits a partir de la sensibilidad medida de cada matriz mediante divergencia KL real. El repositorio ofrece tres ficheros GGUF de distinto tamaño (3,90 GiB, 4,83 GiB y 5,53 GiB) más un proyector de visión en F16, todos ejecutables en llama.cpp estándar.

Con 8.953.803.264 parámetros totales y licencia MIT, el modelo es relevante para quienes necesitan desplegar un agente web multimodal en hardware modesto sin renunciar por completo a la fidelidad respecto al original en BF16. No obstante, las métricas publicadas miden únicamente divergencia KL y perplejidad, no calidad en tareas downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-9B) con proyector de visión; agente de uso de ordenador |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Tres GGUF: 3,74 bpw (IQ3_S/IQ4_XS/Q3_K/Q4_K/Q5_K), 4,64 bpw (Q4_K/IQ4_XS/Q5_K), 5,31 bpw (Q5_K/IQ4_XS/Q4_K); proyector de visión en F16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en BF16 |

## Arquitectura y entrenamiento
El modelo base es Fara1.5-9B de Microsoft, construido sobre Qwen3.5-9B y especializado como agente de uso de ordenador para navegación web. Es multimodal: procesa capturas de pantalla del navegador y genera llamadas a herramientas estructuradas como salida. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens ni si se aplicaron etapas de RLHF o DPO. La model card del autor de la cuantización menciona capas de predicción multi-token (multi-token-prediction) que se mantienen en alta precisión.

La innovación destacable de esta publicación no está en el modelo sino en el proceso de cuantización. El autor parte del GGUF en BF16 y de la importance matrix de bartowski/Fara1.5-9B-GGUF, cuantiza cada matriz grande una vez por cada tipo candidato (Q2_K, IQ2_S, IQ3_XXS, IQ3_S, Q3_K, IQ4_XS, Q4_K, Q5_K, Q6_K, Q8_0), estima el error por matriz ponderado por importancia y lo escala con un factor de sensibilidad medido mediante divergencia KL real (moviendo grupos de tensores como las proyecciones down de la FFN, las proyecciones value de atención y las capas primera y última). Finalmente resuelve una asignación exacta de presupuesto (mochila múltiple sobre bytes) para elegir un tipo por matriz en cada tamaño objetivo, ensamblando el modelo desde los tensores ya almacenados sin recuantizar. Las normas, los tensores pequeños y las capas de predicción multi-token se mantienen en alta precisión.

## Capacidades
- Comprensión de capturas de pantalla de navegador (entrada image-text-to-text) y emisión de llamadas a herramientas estructuradas para interactuar con la web.
- Automatización de tareas de navegación como agente de uso de ordenador.
- Generación de texto conversacional en el contexto de la interacción agente-entorno.
- Soporte de tool calling / function calling estructurado, inherente a su diseño como agente.
- Razonamiento multi-paso orientado a la ejecución de acciones sucesivas en un entorno web.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión adicional o audio: no disponibles en la información proporcionada más allá del proyector de visión incluido.

## Casos de uso
- Automatización de flujos de navegación web: el modelo puede leer la captura de pantalla del navegador y emitir la siguiente acción estructurada, lo que permite encadenar pasos en tareas como rellenar formularios o extraer datos de portales.
- Pruebas de regresión de agentes web en CI: al ser un GGUF ligero (desde 3,90 GiB), puede desplegarse en runners con GPU modesta para validar que los cambios en el entorno no rompen las secuencias de acciones del agente.
- Asistentes de soporte que operan sobre una interfaz web interna: el modelo puede interpretar el estado visual de la aplicación y proponer o ejecutar la acción siguiente dentro de un sandbox.
- Investigación en seguridad de agentes: permite reproducir y analizar el comportamiento del agente Fara1.5-9B en local con cuantización controlada, comparando la fidelidad de cada tamaño de fichero mediante las métricas KL publicadas.
- Despliegue en hardware de consumo para demos de computer use: con el fichero de 4,83 GiB cabe en GPUs de 8 GB y permite mostrar el ciclo captura-decisión-acción sin infraestructura de datacenter.
- Evaluación de métodos de cuantización: el repositorio sirve como referencia práctica para estudiar la asignación de bits por sensibilidad medida frente a cuantizaciones imatrix convencionales del mismo modelo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor publica métricas de fidelidad de cuantización (divergencia KL y perplejidad) frente al BF16, no de calidad downstream:

| Cuantizacion | Origen | Tamano | KLD en | KLD dev | KLD wiki | PPL en | Mismo token top (media) |
|---|---|---:|---:|---:|---:|---:|---:|
| Sakura 3.91GiB | este repo | 3,91 GiB | 0,0611 | 0,0600 | 0,1071 | 1,963 | 89,8 % |
| IQ3_XXS | bartowski (imatrix) | 3,98 GiB | 0,0937 | 0,0981 | 0,1662 | 1,993 | 88,0 % |
| Sakura 4.84GiB | este repo | 4,84 GiB | 0,0158 | 0,0171 | 0,0282 | 1,926 | 94,6 % |
| IQ4_XS | bartowski (imatrix) | 4,88 GiB | 0,0194 | 0,0224 | 0,0325 | 1,913 | 94,6 % |
| Q4_K_M | bartowski (imatrix) | 5,50 GiB | 0,0129 | 0,0131 | 0,0218 | 1,912 | 95,6 % |
| Sakura 5.54GiB | este repo | 5,54 GiB | 0,0082 | 0,0085 | 0,0114 | 1,918 | 96,4 % |

Referencia BF16: PPL en 1,901; dev 2,044; wiki 8,878. Medición con 12 fragmentos de 512 tokens por texto, una sola máquina; el propio autor advierte que diferencias pequeñas de KLD a tamaño similar no constituyen un ranking de calidad.

## Requisitos de hardware
- VRAM estimada: el fichero de 3,90 GiB requiere aproximadamente 4-5 GB de VRAM; el de 4,83 GiB, unos 5-6 GB; el de 5,53 GiB, unos 6-7 GB, más el proyector de visión F16 y el contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para uso en consumer; A100 o H100 para despliegues con concurrencia o contextos largos.
- Cabe en GPU de consumo: sí, los tres ficheros caben en GPUs de 8 GB o más, incluido el de 5,53 GiB con margen ajustado.
- Opciones de despliegue: llama.cpp estándar (los tipos ggml son nativos), y por extensión Ollama u otros frontends basados en llama.cpp; requiere cargar también el proyector de visión mmproj-Fara1.5-9B-f16.gguf para las capacidades multimodales.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Sakura-Fara1.5-9B-GGUF (este) | 8,95 B | no disponible | GGUF (3 tamanos) | MIT | Cuantizacion por sensibilidad medida; KLD hasta 40 % menor que imatrix a tamano comparable |
| bartowski/Fara1.5-9B-GGUF | 8,95 B | no disponible | GGUF (imatrix) | MIT (heredada del base) | Referencia de comparacion del autor; incluye el proyector F16 reutilizado aqui |
| microsoft/Fara1.5-9B | 8,95 B | no disponible | BF16 (safetensors) | MIT | Modelo original de Microsoft; referencia de calidad y origen de los pesos |

No se dispone de datos para comparar con otros agentes de computer use de tamano similar en la información proporcionada.

## Limitaciones y advertencias
- Las métricas publicadas son solo divergencia KL y perplejidad sobre textos cortos retenidos; no hay evaluación en benchmarks de tareas, por lo que no deben interpretarse como garantía de calidad funcional.
- La cuantización siempre degrada algo de calidad; el fichero más pequeño (3,74 bpw) es el que más pierde y el propio autor lo desaconseja para presupuestos de memoria no ajustados.
- Fara es un agente de uso de ordenador: Microsoft recomienda ejecutarlo únicamente dentro de un sandbox con monitorización (MagenticLite) y describe comportamientos de seguridad como detenerse y preguntar antes de pagos, datos personales y acciones irreversibles. Esa supervisión debe mantenerse también con la versión cuantizada.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información proporcionada; es esperable en un modelo de 9 B orientado a agentes.
- Idiomas soportados: no disponibles; no se puede confirmar el comportamiento en castellano.
- Licencia MIT, que permite uso comercial, pero al ser una cuantización comunitaria no oficial de Microsoft conviene verificar la procedencia de los pesos y las condiciones del modelo base antes de un despliegue en producción.
- El autor no publica las elecciones de tipo por tensor, lo que limita la reproducibilidad exacta del método.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/webmp3/Sakura-Fara1.5-9B-GGUF
- Modelo base: https://huggingface.co/microsoft/Fara1.5-9B
- Cuantizaciones de referencia (bartowski): https://huggingface.co/bartowski/Fara1.5-9B-GGUF
- Colección Sakura Mini: https://huggingface.co/collections/webmp3/sakura-mini-6aba73f6a5a41296a3540373
- llama.cpp: https://github.com/ggml-org/llama.cpp
