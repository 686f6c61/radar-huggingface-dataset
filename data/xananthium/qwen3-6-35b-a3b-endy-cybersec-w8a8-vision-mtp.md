# Xananthium/Qwen3.6-35B-A3B-Endy-CyberSec-W8A8-Vision-MTP

## Resumen

Este checkpoint es una version cuantizada a 8 bits (W8A8, formato compressed-tensors) del fine-tune endystrike/Endy-Qwen3.6-CyberSec-35B-A3B, que a su vez deriva del modelo base Qwen/Qwen3.6-35B-A3B. Lo publica el usuario Xananthium con el objetivo de ofrecer una copia completa lista para inferencia local, con pesos en safetensors y 35.951.822.704 parametros totales (unos 35,95 mil millones) repartidos en un repositorio de 38,4 GB.

El modelo base Qwen3.6-35B-A3B es, segun la documentacion publica de vLLM, un MoE disperso de la familia Qwen3.6 con unos 3B de parametros activos por token y una arquitectura de atencion hibrida (GDN + atencion completa), la misma empleada por los modelos de la generacion Qwen3.5. El sufijo CyberSec indica que el fine-tune intermedio esta orientado a tareas de ciberseguridad, mientras que las etiquetas Vision y MTP del nombre sugieren capacidades multimodales y de prediccion multi-token, aunque ninguna de las dos esta documentada en la model card publicada.

Es relevante ahora porque demuestra el flujo tipico de la comunidad: un modelo grande disperso, un fine-tune de dominio especifico y una cuantizacion W8A8 para reducir requisitos de memoria en despliegue local. No obstante, el propio autor advierte de que las unicas mediciones incluidas son pruebas sinteticas pequenas recogidas en results/precision-comparison.json y que no existen puntuaciones publicadas en benchmarks de ciberseguridad; los artefactos no probados no tienen resultados medidos. El repositorio registra 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso (sparse MoE) con atencion hibrida GDN + atencion completa, segun la documentacion del modelo base Qwen3.6-35B-A3B; etiqueta de safetensors: qwen3_5_moe |
| Parametros totales | 35.951.822.704 (unos 35,95 mil millones) |
| Parametros activos | no disponible en la model card; la documentacion del modelo base cita aproximadamente 3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A8 (8 bits en pesos y activaciones), compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (cuantizados, compressed-tensors, 8-bit) |
| Autor | Xananthium |
| Modelo base | endystrike/Endy-Qwen3.6-CyberSec-35B-A3B |
| Modelo original | Qwen/Qwen3.6-35B-A3B |
| Tamano del repositorio | 38,4 GB |
| Fecha de publicacion | 2026-10-06 |

## Arquitectura y entrenamiento

La arquitectura heredada del modelo original es un transformer disperso de tipo MoE (mixture of experts) con atencion hibrida: segun la documentacion de vLLM para Qwen3.6-35B-A3B, combina GDN con atencion completa, el mismo esquema que emplean los modelos de la generacion Qwen3.5. El modelo declara 35.951.822.704 parametros totales y, de acuerdo con la misma fuente, activa aproximadamente 3B de parametros por token, lo que permite un coste de computo por token muy inferior al de un modelo denso del mismo tamano. La etiqueta qwen3_5_moe en los safetensors confirma la familia arquitectonica, y los tags del repositorio incluyen compressed-tensors, el formato de cuantizacion usado.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si el fine-tune de ciberseguridad empleo RLHF, DPO u otra tecnica de alineamiento: la model card publicada no detalla el proceso. El autor indica que se trata de un fine-tune distinto del publicado bajo el nombre Hauhau y remite al README original del modelo base (preservado en README_ORIGINAL.md) para los detalles de entrenamiento, sin reproducirlos. El sufijo MTP del nombre sugiere prediccion multi-token y Vision sugiere capacidad multimodal (NVIDIA NGC lista modalidad de datos texto e imagen para Qwen3.6-35B-A3B), pero ninguno de estos dos aspectos esta confirmado ni documentado en la model card de este checkpoint.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Qwen3.6-35B-A3B.
- Orientacion especifica a ciberseguridad por el fine-tune intermedio Endy-Qwen3.6-CyberSec-35B-A3B.
- Posible soporte de entrada de imagen, segun la etiqueta Vision del nombre y la modalidad texto+imagen listada para el modelo base en NVIDIA NGC (no confirmado en la model card).
- Posible prediccion multi-token (MTP) por el sufijo del nombre (no documentado).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no enumera idiomas.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis asistido de alertas de seguridad: el modelo puede integrarse en un SOC para resumir y clasificar alertas, aprovechando que el fine-tune esta orientado a ciberseguridad; requiere validacion humana por la ausencia de benchmarks publicados.
- Generacion de reglas y firmas de deteccion: redaccion de reglas Sigma, YARA o Suricata a partir de descripciones de incidentes, con revision posterior por un analista.
- Explicacion de vulnerabilidades y CVEs: resumir boletines tecnicos y proponer mitigaciones, siempre con verificacion contra la fuente oficial.
- Formacion y simulacion en ciberseguridad: generar escenarios de CTF o ejercicios de respuesta a incidentes en entornos controlados.
- Inferencia local en hardware propio: el formato W8A8 y el despliegue en safetensors permiten servir el modelo en estaciones con GPU de 40-80 GB sin depender de APIs externas, util para datos sensibles.
- Investigacion sobre cuantizacion: sirve como caso de estudio para medir el impacto de la cuantizacion W8A8 frente a los pesos originales, usando el archivo results/precision-comparison.json como punto de partida (pruebas sinteticas).
- Analisis de documentos tecnicos multimodales: si se confirma la capacidad de vision, podria procesar capturas de paneles de monitorizacion o diagramas de red junto a texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones incluidas en results/precision-comparison.json son pruebas sinteticas pequenas, no puntuaciones de benchmarks de ciberseguridad publicados, y que los artefactos no probados no tienen resultados medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 38,4 GB en W8A8, por lo que se necesitan al menos unos 40 GB de VRAM solo para los pesos, mas el margen para cache KV segun la longitud de contexto (no disponible).
- GPU recomendadas: H100 (80 GB) o A100 (80 GB) para servir el modelo completo en una sola GPU; A100 de 40 GB queda muy justa y probablemente requiera offload o particionado.
- Consumer GPU: no cabe en una RTX 4090 (24 GB) ni en una RTX 3090 (24 GB) por si solo; seria necesario repartirlo entre dos GPU de 24 GB o aplicar tecnicas de offload a CPU, con la penalizacion de latencia correspondiente.
- Opciones de despliegue: vLLM es la via documentada para el modelo base Qwen3.6-35B-A3B (existe guia especifica en vLLM Ascend); el formato compressed-tensors es soportado por vLLM y por transformers con la libreria compressed-tensors. No se proporciona GGUF en este repositorio, por lo que llama.cpp u Ollama requeririan una conversion adicional.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos por token | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xananthium/Qwen3.6-35B-A3B-Endy-CyberSec-W8A8-Vision-MTP | 35,95B | aprox. 3B (heredado del base, no confirmado) | no disponible | apache-2.0 | safetensors W8A8 (compressed-tensors) |
| endystrike/Endy-Qwen3.6-CyberSec-35B-A3B | no disponible | no disponible | no disponible | no disponible | pesos completos del fine-tune de ciberseguridad |
| Qwen/Qwen3.6-35B-A3B | 35B (segun documentacion) | aprox. 3B | no disponible | no disponible en la informacion recogida | modelo base original, con soporte en vLLM |
| Qwen3.5-35B-A3B | no disponible | no disponible | no disponible | no disponible | citado como referencia arquitectonica en la documentacion de vLLM |

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados: el autor solo incluye pruebas sinteticas pequenas en results/precision-comparison.json, por lo que el rendimiento real en tareas de ciberseguridad no esta verificado.
- El propio autor advierte de que los resultados de Endy se incluyen con salvedades explicitas de muestreo e historial, lo que limita su reproducibilidad.
- Riesgo de alucinacion: al ser un modelo de lenguaje sin verificacion factual especifica documentada, puede generar comandos, reglas o procedimientos incorrectos; en ciberseguridad esto es especialmente delicado.
- El uso del modelo para tareas ofensivas o generacion de exploits plantea riesgos de mal uso que deben gestionarse con politicas de uso interno.
- Sesgos conocidos: no disponible; no se documenta ninguna evaluacion de sesgo.
- Limitaciones de contexto e idioma: no disponibles; no se especifica la longitud de contexto ni la lista de idiomas soportados.
- Restricciones de licencia: la licencia declarada es apache-2.0, pero la model card indica que las licencias upstream aplican y que el README original se conserva en README_ORIGINAL.md; conviene revisarlo antes de uso comercial.
- La cuantizacion W8A8 puede degradar ligeramente la calidad respecto a los pesos en precision completa; no se proporciona una comparativa detallada mas alla de las pruebas sinteticas citadas.
- El repositorio tiene 0 descargas y 0 likes, sin validacion de la comunidad, lo que reduce la confianza en su comportamiento en produccion.
- No se proporciona pipeline declarado en HuggingFace, lo que complica el uso directo con la API de pipelines.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Xananthium/Qwen3.6-35B-A3B-Endy-CyberSec-W8A8-Vision-MTP
- Modelo base del fine-tune: https://huggingface.co/endystrike/Endy-Qwen3.6-CyberSec-35B-A3B
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Documentacion de vLLM Ascend para Qwen3.6-35B-A3B: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.6-35B-A3B.html
- Version de vLLM Ascend 0.18.0: https://docs.vllm.ai/projects/ascend/en/v0.18.0/tutorials/models/Qwen3.6-35B-A3B.html
- Ficha en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/teams/qwen/models/qwen3.6-35b-a3b
