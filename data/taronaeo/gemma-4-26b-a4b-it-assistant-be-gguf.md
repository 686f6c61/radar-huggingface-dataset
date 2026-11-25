# taronaeo/Gemma-4-26B-A4B-IT-Assistant-BE-GGUF

## Resumen

Gemma-4-26B-A4B-IT-Assistant-BE-GGUF es una cuantización en formato GGUF del modelo asistente (drafter MTP) de Google DeepMind, adaptada específicamente para su ejecución en arquitecturas IBM Z y LinuxONE (s390x, z15, z16, z17). El trabajo lo publica el usuario taronaeo, no Google, y su rasgo diferencial es que los pesos están reordenados en bytes (byte-swapped) para funcionar en sistemas big-endian, algo que el formato GGUF estándar no contempla por defecto. El modelo base es `google/gemma-4-26B-A4B-it-assistant`, un drafter de Multi-Token Prediction (MTP) pensado para decodificación especulativa junto a los modelos principales de la familia Gemma 4.

El modelo resuelve un problema muy concreto: permitir que los modelos Gemma 4 se aceleren mediante decodificación especulativa en mainframes IBM, un nicho donde llama.cpp ya soporta s390x pero donde los pesos publicados en Hugging Face no son directamente utilizables por el orden de bytes. Con esta cuantización, un operador de mainframe puede lanzar un servidor compatible con la API de inferencia apuntando a este repositorio con un único comando.

Es relevante por su carácter pionero en el ecosistema open source: no hay muchos artefactos GGUF orientados a big-endian, y este demuestra que el pipeline de llama.cpp puede extenderse a plataformas tradicionalmente ignoradas. Ahora bien, conviene leer la ficha con cautela: el nombre del repositorio sugiere "26B-A4B", pero el recuento real de parámetros en safetensors es de unos 420 millones, coherente con un drafter pequeño y no con un modelo de 26 000 millones. Los tamaños de archivo de la model card (entre 277 MB y 815 MB) confirman esa escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (drafter MTP para decodificación especulativa); pesos byte-swapped para big-endian |
| Parámetros totales | 419 711 492 (según safetensors del repo) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_0, Q5_1, Q5_K_S, Q5_K_M, Q6_K, Q8_0, BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (byte-swapped para s390x) |
| Modelo base | google/gemma-4-26B-A4B-it-assistant |
| Tamaño del repositorio | 6,2 GB |
| Pipeline declarado | any-to-any |
| Descargas | 652 |
| Fecha de creación | 2026-11-21 |

## Arquitectura y entrenamiento

El modelo base es un drafter de Multi-Token Prediction (MTP) de Google DeepMind. La técnica MTP consiste en extender un modelo principal con un modelo borrador más pequeño y rápido que predice varios tokens por delante; el modelo objetivo verifica esas predicciones en paralelo, de modo que la decodificación especulativa acelera la generación sin alterar la distribución de salida (las predicciones rechazadas se descartan). La model card enlaza la documentación oficial de MTP de Google y el informe técnico arXiv:2607.02770 para los detalles de entrenamiento.

Sobre el entrenamiento del modelo base no se aportan datos en la información disponible: no se indica el número de tokens, la composición del dataset ni si hubo RLHF o DPO. Lo que sí es específico de esta publicación es el post-procesado: los pesos se han convertido a GGUF y se han reordenado en bytes para que funcionen en sistemas big-endian (IBM Z y LinuxONE). El autor remite a la guía de compilación para s390x de llama.cpp, lo que implica que la inferencia se realiza con llama.cpp/llama-server compilado para esa plataforma. La model card también declara el tag `endpoints_compatible`, aunque no detalla qué endpoints concretos.

## Capacidades

- Decodificación especulativa: actúa como drafter MTP para acelerar la generación del modelo objetivo Gemma 4, prediciendo varios tokens que el modelo principal verifica en paralelo.
- Generación de texto asistente: al ser un modelo "it-assistant", está orientado a tareas de asistencia conversacional, aunque la información disponible no detalla sus capacidades exactas.
- Multimodalidad declarada: el pipeline tag es `any-to-any`, lo que sugiere soporte de más de una modalidad, pero no se especifica cuáles.
- Ejecución en mainframe: es la capacidad operativa diferencial; los pesos están preparados para s390x big-endian en z15, z16 y z17.
- Compatibilidad con llama.cpp: se puede servir con `llama-server` y consumir vía API compatible con endpoints de inferencia.
- Tool calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el campo de idiomas no está cumplimentado.

## Casos de uso

- Aceleración de inferencia en mainframe IBM: desplegar este drafter junto al modelo objetivo Gemma 4 en un z16 o z17 para reducir la latencia de generación mediante decodificación especulativa, aprovechando que los pesos ya están byte-swapped y no requieren conversión manual.
- Servicio de asistencia conversacional en LinuxONE: montar un `llama-server` con el cuantizado Q4_K_M (unos 310 MB) y exponer una API compatible con endpoints para integrarla en aplicaciones internas de la organización que ya corre sobre s390x.
- Pruebas de compatibilidad big-endian: usar el repositorio como referencia para validar que el pipeline de llama.cpp compilado para s390x carga y ejecuta correctamente pesos GGUF, antes de abordar modelos de mayor tamaño.
- Investigación sobre decodificación especulativa: comparar la tasa de aceptación del drafter MTP en distintas cuantizaciones (Q4_K_M frente a Q8_0 o BF16) para medir el impacto de la cuantización en la velocidad de decodificación.
- Despliegue con huella de memoria mínima: en entornos mainframe con recursos muy compartidos, elegir Q2_K (277,7 MB) o Q3_K_S (287,1 MB) para mantener el drafter residente en memoria con un coste reducido, asumiendo la pérdida de calidad que advierte el autor.
- Formación y demostraciones: reproducir la guía de compilación para s390x de llama.cpp con un artefacto pequeño y descargable (652 descargas registradas) para enseñar el flujo completo de cuantización y ejecución en arquitecturas no x86.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de tasa de aceptación del drafter, y el autor no aporta cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: al tratarse de un drafter de unos 420 millones de parámetros, el peso de los ficheros va de 277,7 MB (Q2_K) a 815,6 MB (BF16); la memoria necesaria para inferencia es del orden de unos pocos GB incluyendo el contexto y el runtime, aunque no se publican cifras exactas.
- GPU recomendadas: no disponible; el artefacto está orientado a CPU sobre IBM Z y LinuxONE (s390x), no a GPU.
- Compatibilidad con GPU de consumo: no está documentada para este repositorio; al ser GGUF byte-swapped, no es directamente utilizable en GPUs x86 convencionales sin reconvertir los pesos.
- Opciones de despliegue: llama.cpp y `llama-server` compilados para s390x (guía oficial en el repositorio de llama.cpp); el comando indicado por el autor es `build/bin/llama-server -hf taronaeo/Gemma-4-26B-A4B-IT-Assistant-BE-GGUF:Q4_K_M`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Orientación |
|---|---|---|---|---|---|
| taronaeo/Gemma-4-26B-A4B-IT-Assistant-BE-GGUF | 419,7 M | no disponible | GGUF byte-swapped | Apache 2.0 | Mainframe IBM Z (s390x, big-endian) |
| google/gemma-4-26B-A4B-it-assistant (modelo base) | no disponible en la información | no disponible | safetensors (original) | Apache 2.0 | Decodificación especulativa MTP en plataformas estándar |
| Otras cuantizaciones GGUF de Gemma 4 para x86/ARM | no disponible | no disponible | GGUF little-endian | Apache 2.0 | Servidores y estaciones de trabajo convencionales |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Naturaleza del artefacto: es una cuantización de un drafter MTP, no un modelo principal; su función es acelerar a otro modelo y no sustituirlo en tareas de generación autónoma de alta calidad.
- Discrepancia de nomenclatura: el nombre del repositorio menciona "26B-A4B", pero el recuento real de parámetros es de unos 420 millones; conviene verificar el contenido antes de planificar un despliegue.
- Compatibilidad restringida: los pesos están byte-swapped para big-endian; no son utilizables directamente en plataformas little-endian (x86, ARM) sin reconversión.
- Cuantizaciones agresivas: el autor advierte de pérdida significativa de calidad en Q2_K y pérdida alta en las variantes Q3_K; para producción recomienda Q4_K_M o superiores.
- Idiomas y contexto: no se documentan los idiomas soportados ni la longitud de contexto, lo que impide garantizar su comportamiento en casos multilingües o con ventanas largas.
- Sesgos y alucinación: no se publica información sobre sesgos ni sobre tasas de alucinación del modelo base; al ser un drafter, las predicciones se verifican contra el modelo objetivo, lo que mitiga pero no elimina el riesgo.
- Licencia: se declara Apache 2.0, pero se enlaza la licencia específica de Gemma 4 de Google; conviene revisar los términos de esa licencia antes de un uso comercial, ya que pueden imponer condiciones adicionales.
- Mantenimiento: el repositorio tiene 0 likes y fue creado y actualizado el mismo día (2026-11-21), sin historial de mantenimiento posterior.
- Ausencia de benchmarks: no hay métricas publicadas que permitan estimar la ganancia real de velocidad de la decodificación especulativa en s390x.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taronaeo/Gemma-4-26B-A4B-IT-Assistant-BE-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it-assistant
- Colección Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Documentación de MTP: https://ai.google.dev/gemma/docs/mtp/mtp
- Informe técnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de modelos Gemma de Google DeepMind: https://deepmind.google/models/gemma/
- Guía de compilación para s390x de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/build-s390x.md
