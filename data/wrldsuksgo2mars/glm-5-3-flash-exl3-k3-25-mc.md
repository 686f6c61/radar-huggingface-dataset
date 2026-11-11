# wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K3.25-MC

## Resumen

GLM-5.3-Flash-EXL3-K3.25-MC es una cuantización de 3 bits del modelo multimodal GLM-5.3-Flash-BF16, desarrollado originalmente por Zhipu AI (zai-org) y reempaquetado por el usuario wrldsuksgo2mars. El modelo base es un transformer multimodal de tipo image-text-to-text con 73.422.639.454 parámetros totales, orientado a conversación, razonamiento agéntico y procesamiento conjunto de imagen y texto. Esta versión emplea el formato EXL3 (ExLlamaV3) con una mezcla de precisión K3/K4 en las capas expertas y mantiene el drafter MTP (multi-token prediction) de la capa 45 en K4.

El interés de este repack reside en reducir el peso del modelo desde BF16 hasta aproximadamente 160,7 GB de repositorio mediante cuantización de 3 bits, preservando supuestamente la equivalencia byte a byte con el núcleo K4 original verificado. El autor declara explícitamente que el reempaquetado no introduce nuevas afirmaciones de rendimiento ni de calidad, y remite a un fichero `package-validation.json` para las pruebas de bytes. Es, por tanto, un artefacto de interés para quienes necesiten desplegar el modelo en infraestructura con VRAM limitada usando el ecosistema ExLlamaV3.

La licencia es MIT, lo que facilita el uso comercial, aunque conviene verificar las condiciones del modelo base original. El modelo fue creado el 11 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes, por lo que se trata de una publicación reciente y sin validación comunitaria independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con capas expertas y drafter MTP; arquitectura interna del base no detallada en la información disponible |
| Parametros totales | 73.422.639.454 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 de 3 bits con mezcla K3/K4 en capas 3-44; drafter MTP de capa 45 en K4; vistas alternativas K8 y K6 completas |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base GLM-5.3-Flash-BF16 más allá de su naturaleza multimodal image-text-to-text. El repack conserva el núcleo BF16 como vista por defecto y ofrece vistas alternativas K8 y K6 completas. Las capas 3 a 44 emplean expertos con cuantización mixta K3/K4 derivados del núcleo FP8 del repositorio `wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K3.25-Core-FP8`, mientras que la capa 45, correspondiente al drafter MTP, permanece en K4 desde el paquete MC padre. No se retiene ningún payload del núcleo FP8 del proveedor original.

El autor indica que el núcleo, los tensores nativos compartidos y los recursos multimedia incluidos derivan del paquete K4 MC verificado con hash `91a8dbc9c12e790c65aa1a38c6aede6a3e23a77d`. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo base. El dataset citado (`wrldsuksgo2mars/agentic-quant-panel-v1`) parece asociado al proceso de cuantización agéntica, no al entrenamiento del modelo original.

## Capacidades

- Generación de texto y conversación multi-turno en formato image-text-to-text.
- Procesamiento conjunto de imágenes y texto (pipeline image-text-to-text declarado).
- Razonamiento agéntico: el modelo base pertenece a la familia GLM orientada a tareas de agente, aunque las capacidades concretas del base no se detallan en la información disponible.
- Decodificación con drafter MTP (multi-token prediction) en la capa 45, lo que sugiere soporte de decodificación especulativa para acelerar la generación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el campo de idiomas no está relleno en la ficha de Hugging Face.
- Modo thinking explícito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue en infraestructura con VRAM limitada: la cuantización EXL3 de 3 bits reduce el peso del modelo hasta unos 160,7 GB de repositorio, lo que permite ejecutar un modelo de 73.400 millones de parámetros en configuraciones multi-GPU que no admitirían la versión BF16 completa, usando ExLlamaV3 como motor de inferencia.
- Asistentes conversacionales multimodales: al declarar el pipeline image-text-to-text, el modelo puede gestionar diálogos en los que el usuario adjunta imágenes junto con texto, adecuado para aplicaciones de soporte con capturas de pantalla o documentos escaneados.
- Investigación sobre cuantización extrema: el paquete incluye pruebas de bytes en `package-validation.json` y vistas alternativas K8 y K6, lo que lo convierte en un artefacto útil para estudiar el impacto de la cuantización K3/K4 frente a K6/K8 en la calidad de salida.
- Evaluación de decodificación especulativa: la presencia del drafter MTP en K4 permite experimentar con decodificación multi-token prediction en entornos ExLlamaV3 y medir ganancias de throughput.
- Prototipado de agentes con presupuesto de hardware ajustado: para equipos que necesiten un modelo de gran tamaño con capacidades conversacionales y multimodales sin acceso a clústeres de H100 en BF16, esta versión ofrece un punto de partida con licencia MIT.
- Reproducibilidad de artefactos cuantizados: los hashes y pruebas de bytes documentados permiten a investigadores verificar la integridad de la conversión y comparar el comportamiento del modelo frente al núcleo K4 de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que este reempaquetado "no hace nuevas afirmaciones de rendimiento de servicio ni de calidad".

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 160,7 GB, por lo que se necesita al menos esa cantidad de memoria agregada en GPUs para cargar los pesos en formato EXL3 de 3 bits; las vistas K6 y K8 requieren más espacio.
- GPU recomendadas: configuraciones multi-GPU de数据中心 (A100 80 GB, H100 80 GB) en número de dos o más para cubrir los ~161 GB de pesos; no se especifican requisitos oficiales.
- GPU de consumo: no cabe en una única GPU de consumo (RTX 4090 con 24 GB, RTX 3090 con 24 GB) ni en configuraciones típicas de 2×24 GB; se requeriría un número elevado de GPUs de consumo o memoria unificada en CPU, con latencia muy degradada.
- Opciones de despliegue: el formato EXL3 está diseñado para ExLlamaV3; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-EXL3-K3.25-MC | 73.422.639.454 | no disponible | EXL3 3 bits (K3/K4) | MIT | Hugging Face, 0 descargas |
| zai-org/GLM-5.3-Flash-BF16 (base) | no disponible en la información | no disponible | BF16 | no disponible en la información | Hugging Face (referenciado como base) |
| wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K3.25-Core-FP8 | no disponible | no disponible | FP8 | no disponible | Hugging Face (referenciado como origen de expertos) |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La cuantización de 3 bits puede degradar la calidad de salida frente al modelo BF16 original; el autor no aporta métricas de calidad comparativas.
- El modelo no cuenta con validación comunitaria: 0 descargas y 0 likes en el momento de la ficha, lo que implica ausencia de retroalimentación independiente sobre su comportamiento real.
- Los idiomas soportados no están declarados, por lo que no se puede garantizar un rendimiento adecuado en castellano u otros idiomas distintos del inglés sin evaluación previa.
- La longitud de contexto no está disponible, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran tamaño; no se han publicado evaluaciones específicas para esta cuantización.
- Aunque la licencia del repack es MIT, deben verificarse las condiciones del modelo base zai-org/GLM-5.3-Flash-BF16 para uso comercial, ya que la información disponible no las detalla.
- El formato EXL3 limita las opciones de despliegue al ecosistema ExLlamaV3; no se confirma compatibilidad con otros motores de inferencia.
- El tamaño de 160,7 GB exige infraestructura multi-GPU de数据中心, lo que restringe su uso a entornos con hardware especializado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K3.25-MC
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Núcleo FP8 de origen de los expertos: https://huggingface.co/wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K3.25-Core-FP8
- Dataset citado: https://huggingface.co/datasets/wrldsuksgo2mars/agentic-quant-panel-v1
- Pruebas de bytes del paquete: fichero `package-validation.json` en el repositorio del modelo (no se proporciona URL directa en la información disponible).
