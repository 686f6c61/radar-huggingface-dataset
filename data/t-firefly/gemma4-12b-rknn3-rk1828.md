# t-firefly/gemma4-12b-rknn3-rk1828

## Resumen

`t-firefly/gemma4-12b-rknn3-rk1828` es una conversión del modelo multimodal `google/gemma-4-12B-it` de Google DeepMind, publicada por el equipo Firefly AI (T-Head/Firefly) y optimizada para ejecutarse sobre el NPU Rockchip RK1828. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: la model card indica explícitamente que el modelo ha sido "convertido y adaptado" por Firefly a partir del original, cuyo peso intelectual y licencia siguen recayendo en Google. El repositorio ocupa 9,5 GB y no registra descargas ni valoraciones en el momento de la consulta.

El modelo base es un sistema multimodal de 12 000 millones de parámetros con arquitectura unificada sin encoder (*encoder-free unified architecture*), capaz de aceptar entradas de texto, imagen, audio y vídeo y generar texto. Según la model card del original, soporta tareas de razonamiento, generación de código, multilingüismo y flujos agénticos, con una ventana de contexto de 256K tokens y cobertura de más de 140 idiomas. Está diseñado para despliegue en dispositivo y en el borde (*edge*), lo que explica el interés de Firefly por adaptarlo a silicio Rockchip.

La relevancia de esta ficha es doble: por un lado, documenta una vía poco habitual de llevar un modelo multimodal de 12B a hardware NPU de borde, mediante la herramienta de despliegue LlamaPi (`llamapi run gemma4:12b`); por otro, advierte de que las etiquetas del repositorio (GGUF, apache-2.0, `any-to-any`) no coinciden necesariamente con la licencia real del modelo subyacente ni con benchmarks publicados, que no existen en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal unificado sin encoder (*encoder-free unified architecture*), segun la model card del modelo original |
| Parametros totales | 12 000 millones (12B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (256K) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 140+ idiomas segun la model card del modelo original; el campo de idiomas del repositorio figura como no disponible |
| Licencia | apache-2.0 en la etiqueta del repositorio, con enlace a la licencia de Gemma 4 de Google (`ai.google.dev/gemma/docs/gemma_4_license`) |
| Formato de pesos | GGUF (etiqueta del repositorio); conversion orientada al NPU Rockchip RK1828 (sufijo `rknn3` en el nombre y etiquetas `rockchip`, `rk1828`) |
| Plataforma objetivo | Rockchip RK1828 |
| Herramienta de despliegue | LlamaPi (`llamapi run gemma4:12b`) |
| Tamano del repositorio | 9,5 GB |
| Modelo base | google/gemma-4-12B-it |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el proceso de entrenamiento en los materiales consultados. Lo unico documentado es que el modelo original, Gemma 4 12B IT, es un modelo multimodal instruido (*instruction-tuned*) de Google DeepMind con arquitectura unificada sin encoder: procesa texto, imagen, audio y vídeo y produce texto, sin un codificador separado por modalidad. El repositorio de Firefly no aporta datos sobre numero de tokens de entrenamiento, composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO.

La innovacion tecnica de esta publicacion no esta en el modelo, sino en el artefacto de conversion: los pesos se han adaptado para el NPU Rockchip RK1828 y se ejecutan mediante LlamaPi, una herramienta que, segun la model card, gestiona la descarga, la carga y la ejecucion del modelo. El sufijo `rknn3` del identificador sugiere el uso del formato de runtime RKNN en su tercera generacion, aunque no se detalla la cadena de conversion ni el esquema de cuantizacion aplicado.

## Capacidades

- Generacion de texto a partir de entradas multimodales: la model card declara soporte de texto, imagen, audio y vídeo como entrada, con salida exclusivamente textual (`pipeline_tag: any-to-any`).
- Razonamiento y tareas de codigo, segun las capacidades atribuidas al modelo original.
- Soporte multilingue de mas de 140 idiomas, de nuevo segun la documentacion del original.
- Tareas agénticas y de multiples pasos, mencionadas en la descripcion del modelo base.
- Modo conversacional: el repositorio incluye la etiqueta `conversational` y el modelo base es una variante instruida (`-it`).
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`.
- Ejecucion en dispositivo de borde mediante LlamaPi sobre RK1828.
- No se documenta en el repositorio si se mantiene soporte explicito de *tool calling* o de modo de razonamiento extendido (*thinking mode*) tras la conversion.

## Casos de uso

- Asistente conversacional local en dispositivos de borde: el modelo puede gestionar dialogos multi-turno con una ventana de 256K tokens, lo que permite mantener historiales extensos sin truncado agresivo en un equipo con NPU RK1828 y sin conexion a la nube.
- Transcripcion y resumen de reuniones con audio y video: al aceptar entradas de audio y vídeo, puede generar actas o resumenes textuales directamente en el dispositivo, evitando enviar material sensible a servidores externos.
- Descripcion de imagenes y accesibilidad: la entrada de imagen permite generar descripciones textuales para lectores de pantalla o catalogacion automatica de fotos en aplicaciones moviles.
- Analisis de documentos escaneados en campo: en entornos industriales o de campo sin conectividad estable, el modelo puede procesar capturas o videoclips y devolver texto estructurado.
- Interfaces conversacionales para electrodomesticos y equipos industriales: la combinacion de tamano 12B, despliegue en NPU y soporte multilingue lo hace candidato para asistentes embebidos con control por voz y contexto largo de sesion.
- Preprocesado multimodal en pipelines de edge computing: extraccion de texto y resumenes a partir de flujos de video antes de enviar solo el resultado a un backend central, reduciendo ancho de banda.
- Prototipado de producto en hardware Rockchip: el comando `llamapi run gemma4:12b` simplifica la validacion temprana de ideas sobre el propio silicio objetivo en lugar de sobre una GPU de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de Firefly no incluye tabla de evaluaciones (MMLU, HumanEval, GSM8K ni equivalentes multimodales), y las busquedas web realizadas no devolvieron material tecnico relacionado con el modelo. No se dispone tampoco de mediciones de latencia o throughput sobre RK1828.

## Requisitos de hardware

- Plataforma objetivo declarada: NPU Rockchip RK1828, con despliegue mediante LlamaPi.
- VRAM estimada para inferencia en GPU, calculada a partir del numero de parametros (12B), no confirmada por el autor: unos 24 GB en fp16/bf16, unos 12 GB en int8 y entre 6 y 7 GB en int4.
- El repositorio ocupa 9,5 GB, cifra coherente con una cuantizacion de aproximadamente 8 bits o mixta; el esquema exacto no esta documentado.
- GPU compatibles estimadas: A100 40/80 GB o H100 para precision completa; RTX 4090 (24 GB) para int8 o int4; GPUs con 8-12 GB para int4.
- Cabe en GPU de consumo: si, previsiblemente en RTX 4090, RTX 3090 y modelos con 12 GB o mas si se usa cuantizacion de 4 bits.
- Opciones de despliegue: LlamaPi sobre RK1828 (via oficial documentada); llama.cpp u Ollama para el artefacto GGUF; vLLM o TGI requeririan pesos en safetensors, que este repositorio no declara incluir.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| t-firefly/gemma4-12b-rknn3-rk1828 | 12B | 256K | Entrada texto, imagen, audio y video; salida texto | apache-2.0 en la etiqueta del repositorio, con enlace a la licencia Gemma 4 | Conversion para NPU RK1828, 9,5 GB, 0 descargas |
| google/gemma-4-12B-it | 12B | 256K | Entrada texto, imagen, audio y video; salida texto | Licencia Gemma 4 de Google | Pesos originales en Hugging Face y ModelScope |
| Otras alternativas de 12B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante es entre el artefacto convertido y su original: comparten arquitectura, numero de parametros y ventana de contexto, y se diferencian en el formato de pesos, la plataforma de ejecucion y el licenciamiento aplicable. No se dispone de informacion sobre otros modelos comparables en la documentacion consultada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evaluaciones publicadas para esta conversion, por lo que se desconoce la degradacion de calidad respecto al modelo original.
- Ambiguedad de licencia: la etiqueta del repositorio indica `apache-2.0`, pero el enlace de licencia apunta a la licencia de Gemma 4 de Google y la propia model card reconoce que los derechos del modelo subyacente pertenecen al equipo original. Antes de un uso comercial debe verificarse que terminos se aplican realmente.
- Artefacto de conversion, no modelo original: los pesos han sido transformados por un tercero (Firefly AI Team); no se documenta el pipeline de conversion ni el esquema de cuantizacion, lo que dificulta reproducir o auditar el resultado.
- Riesgo de alucinacion: inherente a los modelos generativos de esta familia; no se ha publicado ninguna evaluacion especifica de fidelidad tras la conversion.
- Sesgos: no se documentan analisis de sesgo para esta conversion. Al heredar el comportamiento del modelo base, pueden aparecer los sesgos presentes en sus datos de entrenamiento, no detallados en la informacion disponible.
- Limitaciones de idioma: la cobertura de 140+ idiomas procede de la documentacion del modelo original y no se ha verificado sobre la version convertida.
- Cero validacion de la comunidad: el repositorio registra 0 descargas y 0 valoraciones, por lo que no existe retroalimentacion de terceros sobre su funcionamiento real.
- Dependencia de plataforma: el artefacto esta pensado para RK1828 y LlamaPi; fuera de ese entorno su utilidad practica esta por confirmar, incluso aunque la etiqueta `gguf` sugiera compatibilidad con otros runners.
- Contexto de 256K tokens: no se documenta si la ventana completa es alcanzable en el NPU objetivo, donde la memoria disponible suele ser el factor limitante.
- Fechas del repositorio: los metadatos indican creacion y actualizacion en septiembre de 2026; conviene verificar la vigencia de la informacion en el momento de la consulta.

## Enlaces

- Pagina de Hugging Face del modelo: https://huggingface.co/t-firefly/gemma4-12b-rknn3-rk1828
- Modelo base en Hugging Face: https://huggingface.co/google/gemma-4-12B-it
- Modelo base en ModelScope: https://modelscope.cn/models/google/gemma-4-12B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Web de Firefly: https://www.t-firefly.com/
- Documentacion de LlamaPi: https://community.t-firefly.com/en/docs/ai/applications/LlamaPi/llamapi/introduction
- Wiki de LlamaPi: https://community.t-firefly.com/en/docs/ai/applications/LlamaPi/llamapi/introduction
