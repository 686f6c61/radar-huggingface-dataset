# Xananthium/Qwen3.6-35B-A3B-Endy-CyberSec-W8A16-Vision-MTP

## Resumen

Este checkpoint es una conversión cuantizada y multimodal del fine-tune de ciberseguridad `endystrike/Endy-Qwen3.6-CyberSec-35B-A3B`, publicado por el usuario Xananthium el 6 de octubre de 2026 bajo licencia Apache-2.0. El modelo original sobre el que se construye es `Qwen/Qwen3.6-35B-A3B`, un transformer de tipo mixture-of-experts (MoE) con 35.000 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, presentado por el equipo Qwen de Alibaba en abril de 2026 y orientado a codificación agéntica y razonamiento sobre repositorios completos.

La contribución concreta de este repositorio es triple: en primer lugar, aplica una cuantización W8A16 (pesos en 8 bits, activaciones en 16 bits) en formato `compressed-tensors`; en segundo lugar, conserva la torre de visión del modelo original, por lo que mantiene capacidad multimodal texto-imagen; y en tercer lugar, preserva las cabezas de predicción multi-token (MTP, multi-token prediction) del checkpoint base, presumiblemente para decodificación especulativa. El repositorio ocupa 38,4 GB y declara 35.951.822.704 parámetros reales en los ficheros safetensors.

Es relevante para desarrolladores que necesitan ejecutar inferencia local de un modelo especializado en ciberseguridad con requisitos de memoria reducidos respecto al fine-tune en precisión completa, y que quieran conservar las capacidades multimodales del modelo original. Conviene señalar de entrada que se trata de un artefacto de la comunidad con cero descargas y cero valoraciones en el momento de redactar esta ficha, y que el propio autor advierte de que los resultados incluidos provienen de pruebas sintéticas pequeñas y no de benchmarks de ciberseguridad publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta `qwen3_5_moe`), derivada de Qwen3.6-35B-A3B |
| Parametros totales | 35.951.822.704 (~35,95 B) |
| Parametros activos | ~3 B (heredado del modelo base Qwen3.6-35B-A3B; no confirmado en la model card de este checkpoint) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A16 (pesos 8 bits, activaciones 16 bits) en formato `compressed-tensors`; 8-bit |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache-2.0 (el autor indica que se aplican tambien las licencias upstream) |
| Formato de pesos | safetensors con compresion `compressed-tensors` |
| Tamano del repositorio | 38,4 GB |
| Modelo base del fine-tune | endystrike/Endy-Qwen3.6-CyberSec-35B-A3B |
| Modelo original de la cadena | Qwen/Qwen3.6-35B-A3B |
| Modalidad | Texto e imagen (torre de vision conservada) |
| Cabezas MTP | Preservadas segun el nombre del checkpoint (`-MTP`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.6-35B-A3B: un transformer disperso de tipo mixture-of-experts con 35.000 millones de parámetros totales y unos 3.000 millones activos por token, diseñado por el equipo Qwen para cargas de codificación agéntica y razonamiento a escala de repositorio. El tensor MoE permite mantener una huella de cómputo por token comparable a la de un modelo denso de 3.000 millones de parámetros, a costa de requerir el almacenamiento completo de los 35.950 millones de pesos. Sobre esta base, el autor `endystrike` produjo un fine-tune especializado en ciberseguridad y, posteriormente, Xananthium generó esta conversión cuantizada.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset, ni si el ajuste del fine-tune de ciberseguridad empleó RLHF, DPO u otra técnica de alineamiento. Tampoco se documenta el procedimiento exacto de cuantización más allá de la designación W8A16 y el uso del formato `compressed-tensors`. Lo que sí se explicita en la model card es que este checkpoint conserva la configuración multimodal y la torre de visión del modelo original, y que incorpora las cabezas de predicción multi-token (MTP), un mecanismo habitualmente asociado a la decodificación especulativa para acelerar la generación. El autor hace hincapié en que se trata de un fine-tune distinto del checkpoint `Hauhau` publicado por el mismo usuario, y que los resultados medidos están en `results/precision-comparison.json`, con salvedades explícitas sobre el muestreo y el historial de conversación empleados.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredados del modelo base Qwen3.6-35B-A3B.
- Codificación agéntica: el modelo base fue presentado específicamente por su rendimiento en tareas de código a escala de repositorio.
- Especialización en ciberseguridad: el fine-tune intermedio `Endy-Qwen3.6-CyberSec-35B-A3B` orienta el modelo hacia tareas de seguridad ofensiva y defensiva.
- Capacidad multimodal texto-imagen: la torre de visión se conserva, por lo que puede procesar imágenes además de texto.
- Predicción multi-token (MTP) preservada, potencialmente utilizable para decodificación especulativa.
- Soporte de tool calling y function calling: no confirmado explícitamente en la model card de este checkpoint, aunque es una capacidad habitual de la familia Qwen3.6.
- Soporte de agentes y razonamiento encadenado: no documentado de forma específica para este artefacto.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Triaje de alertas en un SOC: el modelo puede resumir y priorizar alertas de un SIEM, clasificar su severidad y proponer pasos de investigación, aprovechando su especialización en ciberseguridad y su ventana de contexto (no declarada) para procesar varios eventos correlacionados en una misma llamada.
- Análisis y clasificación de muestras de malware: dado un informe o un volcado de comportamiento en texto, el modelo puede extraer indicadores, inferir la familia del binario y redactar un resumen técnico para el analista.
- Generación de reglas de detección: producción asistida de reglas Sigma, YARA o firmas de Snort a partir de una descripción en lenguaje natural de la técnica adversaria objetivo.
- Revisión de código orientada a seguridad: integración en un pipeline de CI/CD como paso de análisis heurístico que señale patrones propensos a inyección, deserialización insegura o gestión incorrecta de secretos, complementando herramientas SAST deterministas.
- Extracción de indicadores de compromiso desde capturas de pantalla o documentación: gracias a la torre de visión conservada, el modelo puede procesar imágenes de paneles, consolas o PDFs escaneados y extraer IPs, dominios y hashes.
- Redacción de inteligencia de amenazas: resumen de avisos de CVE, boletines de fabricantes y reportes de grupos APT, con normalización terminológica y generación de fichas estructuradas.
- Despliegue en entornos air-gapped: al ser un checkpoint local cuantizado a 8 bits, puede ejecutarse en infraestructura sin salida a Internet, requisito habitual en banca, defensa y administración pública.
- Evaluación comparativa de precisión cuantizada: el repositorio incluye `results/precision-comparison.json`, por lo que sirve como referencia para medir la degradación entre distintas configuraciones de cuantización sobre el mismo fine-tune.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica únicamente que existen mediciones en `results/precision-comparison.json` y que corresponden a pruebas sintéticas pequeñas, no a puntuaciones publicadas de benchmarks de ciberseguridad. El autor advierte además que los artefactos no evaluados no tienen puntuaciones medidas. No se dispone de cifras de MMLU, HumanEval, GSM8K, SWE-bench ni de ningún otro conjunto de referencia para este checkpoint, y no se han incluido resultados comparativos con el modelo base en precisión completa.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 36 GB en W8A16 (el repositorio completo son 38,4 GB). Sumando caché KV y buffers de activación, se recomienda un mínimo práctico de 48 GB de VRAM.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200, L40S 48 GB, RTX A6000 48 GB. Una A100 de 40 GB queda al límite y probablemente exija descarga parcial a CPU.
- Cabe en GPU de consumo: no en una única RTX 4090 (24 GB) ni en una RTX 5090 (32 GB). Requiere dos GPU consumer con paralelismo tensorial o recurrir a offloading a memoria del sistema, con la consiguiente penalización de latencia.
- Opciones de despliegue: vLLM es la opción coherente con el formato `compressed-tensors` y con el ecosistema del autor (publica otros checkpoints descritos como «vLLM-ready»). SGLang, TGI u otros servidores compatibles con `compressed-tensors` serían alternativas plausibles, pero no están confirmados en la información disponible.
- llama.cpp / Ollama: no confirmado. Estos motores no consumen el formato `compressed-tensors` de forma nativa, por lo que sería necesaria una conversión adicional a GGUF, no documentada en el repositorio.
- Latencia y throughput estimados: no disponible. Con 3.000 millones de parámetros activos, el coste por token debería ser bajo en términos de cómputo, pero el requisito de memoria para alojar los 36 GB de pesos condiciona el despliegue más que la velocidad de cálculo.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Cuantizacion | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xananthium/Qwen3.6-35B-A3B-Endy-CyberSec-W8A16-Vision-MTP (este) | 35,95 B / ~3 B | W8A16, compressed-tensors | Texto e imagen | Apache-2.0 | 0 descargas, 0 likes |
| endystrike/Endy-Qwen3.6-CyberSec-35B-A3B | No disponible en la informacion (fine-tune sobre 35B/3B) | Precision completa | No disponible | No disponible | Modelo base del anterior |
| Xananthium/Qwen3.6-35B-A3B-Hauhau-Aggressive-W4A16-Vision | 35 B / ~3 B | W4A16 | Texto e imagen | No disponible en la busqueda | Checkpoint hermano, vLLM-ready |
| Qwen/Qwen3.6-35B-A3B | 35 B / 3 B | Precision completa (BF16) | Texto e imagen | Apache-2.0 | Modelo oficial de Alibaba |

El eje diferencial entre los tres artefactos de Xananthium y endystrike es la precisión de la cuantización y el fine-tune de partida: este checkpoint apuesta por 8 bits para preservar mejor el comportamiento del fine-tune de ciberseguridad, mientras que la variante Hauhau Aggressive emplea 4 bits y un fine-tune distinto, con mayor ahorro de memoria pero presumiblemente mayor degradación. No se dispone de datos de rendimiento que permitan cuantificar esa diferencia.

## Limitaciones y advertencias

- Artefacto con nula validación comunitaria: cero descargas y cero valoraciones en el momento de redactar la ficha, lo que implica ausencia de verificación independiente.
- Evidencia empírica muy limitada: el autor reconoce explícitamente que los resultados incluidos provienen de pruebas sintéticas pequeñas y no de benchmarks de ciberseguridad publicados.
- Riesgo de alucinación con consecuencias graves: en dominios de seguridad, una alucinación puede traducirse en falsos negativos ante una amenaza real o en la ejecución de acciones ofensivas mal dirigidas. Toda salida debe validarse con herramientas deterministas.
- Sesgos del fine-tune: los corpus de ciberseguridad tienden a sobrerrepresentar determinadas técnicas, sectores y geografías; no se documenta ninguna mitigación ni evaluación de sesgo.
- Degradación por cuantización no cuantificada: la conversión a W8A16 puede alterar ligeramente el comportamiento respecto al fine-tune original, y no se publican métricas de esa diferencia en la información disponible.
- Idiomas no declarados: el campo de idiomas aparece como no disponible, por lo que no puede asumirse un soporte multilingüe fiable más allá del inglés técnico.
- Longitud de contexto no declarada: condiciona directamente el diseño de aplicaciones que dependan de análisis de repositorios completos o de logs extensos.
- Torres de visión heredadas: no hay indicios de que la parte multimodal haya sido ajustada para el dominio de ciberseguridad, por lo que su precisión en documentos técnicos específicos es incierta.
- Compatibilidad de despliegue restringida: el formato `compressed-tensors` limita las opciones a motores compatibles (vLLM fundamentalmente); el uso con llama.cpp u Ollama exigiría una conversión no documentada.
- Licencia: el repositorio declara Apache-2.0, pero el autor advierte de que se aplican también las licencias upstream, por lo que conviene revisar los términos del fine-tune `endystrike` y del modelo original Qwen antes de un uso comercial.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Xananthium/Qwen3.6-35B-A3B-Endy-CyberSec-W8A16-Vision-MTP
- Modelo base del fine-tune: https://huggingface.co/endystrike/Endy-Qwen3.6-CyberSec-35B-A3B
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Checkpoint hermano (Hauhau Aggressive W4A16 Vision): https://huggingface.co/Xananthium/Qwen3.6-35B-A3B-Hauhau-Aggressive-W4A16-Vision
- Anuncio oficial de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Blog de Alibaba Cloud sobre el lanzamiento: https://www.alibabacloud.com/blog/qwen3-6-35b-a3b-agentic-coding-power-now-open-to-all_603043
- Ficha en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/teams/qwen/models/qwen3.6-35b-a3b
- Analisis independiente en dev.to: https://dev.to/czmilo/qwen36-35b-a3b-complete-review-alibabas-open-source-coding-model-that-beats-frontier-giants-4382
