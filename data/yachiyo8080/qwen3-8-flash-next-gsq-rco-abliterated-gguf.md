# yachiyo8080/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF

## Resumen

Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF es una cuantización GGUF derivada del modelo ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF, publicada por el usuario yachiyo8080. Se trata de una variante "abliterated", es decir, con la dirección de rechazo eliminada mediante la sustitución de tensores, orientada a usos de red-teaming y generación sin restricciones de contenido. El modelo base emplea una arquitectura de mezcla de expertos (MoE) con 176.943.899.520 parámetros totales y un contexto declarado de 262K tokens.

La particularidad técnica de esta ficha es que la abliteración se aplica sobre un modelo ya cuantizado: en lugar de recalcular los tensores cuantizados aprendidos por GSQ, se transplantan 144 tensores de proyección de escritura al flujo residual a lo largo de las 48 capas, sustituyéndolos por los pesos abliterated correspondientes. Según la model card, los valores y escalas aprendidos por GSQ se mantienen intactos y la asignación de tipos por tensor del modelo original se restaura exactamente.

El modelo está pensado para despliegue local mediante llama.cpp, con variantes de cuantización IQ3_S, IQ3_XXS, IQ2_XS y Q2_0, y pipeline image-text-to-text, lo que indica capacidades multimodales de entrada de imagen y texto. La licencia es Apache 2.0 y los idiomas declarados son inglés y chino. El repositorio tiene 217,9 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), transformer; 48 capas segun la model card |
| Parametros totales | 176.943.899.520 |
| Parametros activos | no disponible |
| Longitud de contexto | 262K tokens (segun la model card) |
| Tipos de cuantizacion | IQ3_S, IQ3_XXS, IQ2_XS, Q2_0 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (libreria llama-cpp) |

## Arquitectura y entrenamiento

El modelo base es una arquitectura de mezcla de expertos con 48 capas y aproximadamente 177.000 millones de parámetros totales, según los datos de safetensors y la model card. La variante publicada aquí no entrena el modelo desde cero: parte de las cuantizaciones oficiales de ISTA-DASLab, que aplican una cuantización aprendida denominada GSQ junto con una asignación de tipos por tensor con restricción de presupuesto (RCO). Sobre esa base ya cuantizada, el autor sustituye 144 tensores de proyección de escritura al flujo residual, distribuidos en las 48 capas, por los tensores equivalentes de una release abliterated ya existente.

La innovación técnica declarada es el "tensor transplant": no se recalculan los tensores cuantizados de GSQ ni se reentrena nada, sino que se intercambian únicamente los tensores responsables de la dirección de rechazo, preservando los valores y escalas aprendidos por GSQ y restaurando la asignación de tipos por tensor del modelo original. La model card indica que la build IQ3_S está verificada tensor a tensor con blake2b por tensor, comprobando que solo cambió lo que debía cambiar. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado image-text-to-text.
- Entrada multimodal de imagen y texto, según el pipeline_tag del repositorio.
- Razonamiento de varios pasos (tag "reasoning" en los metadatos).
- Contexto largo de hasta 262K tokens, adecuado para documentos extensos.
- Modo sin restricciones de rechazo (abliterated/uncensored), orientado a red-teaming.
- Soporte multilingüe limitado a inglés y chino.
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.

## Casos de uso

- Red-teaming y evaluación de seguridad: el modelo, al tener eliminada la dirección de rechazo, permite generar respuestas que un modelo alineado bloquearía, lo que facilita la construcción de conjuntos de pruebas adversarios y la auditoría de filtros de contenido en pipelines propios.
- Análisis de documentos largos en inglés o chino: con 262K tokens de contexto, se puede cargar un informe completo o un repositorio de documentación y hacer preguntas sobre él sin trocear el texto.
- Procesamiento de capturas y documentos escaneados: al ser image-text-to-text, admite imágenes junto al texto, útil para extraer información de pantallas, formularios o figuras en un flujo conversacional.
- Despliegue local con llama.cpp: las cuantizaciones IQ2_XS, IQ3_XXS e IQ3_S permiten ejecutar el modelo en estaciones de trabajo con VRAM limitada, sin depender de servicios en la nube.
- Investigación sobre cuantización: al preservar los tensores GSQ y documentar el transplante tensor a tensor, sirve como caso de estudio para medir el impacto de la abliteración sobre un modelo ya cuantizado.
- Generación de contenido sin filtros en entornos controlados: para experimentación creativa o literaria donde se necesita evitar rechazos del modelo, siempre con revisión humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: según la model card, la build Q2_0 ocupa 38,0 GB y la IQ3_S 55,1 GB; IQ3_XXS e IQ2_XS se sitúan entre ambas, aunque no se detalla su tamaño exacto.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, las builds de 38-55 GB requieren GPU con 48 GB o más de VRAM (A100 80GB, H100, o varias GPU consumer).
- GPU consumer: la build Q2_0 de 38 GB no cabe en una RTX 4090 de 24 GB; requeriría offloading a RAM o configuraciones multi-GPU.
- Opciones de despliegue: llama.cpp (librería declarada), con compatibilidad de endpoints; vLLM, Ollama o TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| yachiyo8080/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF | 176,9B totales (MoE) | 262K | Apache 2.0 | GGUF | Abliterated sobre cuantización GSQ-RCO |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | 176,9B totales (MoE) | 262K | Apache 2.0 | GGUF | Modelo base, alineado, sin abliterar |
| SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF | no disponible | no disponible | no disponible | GGUF | Release abliterated referenciada como origen de los tensores |

No se dispone de datos de benchmarks ni de parámetros activos para establecer una comparación de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- La abliteración elimina la dirección de rechazo, por lo que el modelo puede producir contenido dañino, ofensivo o ilegal; no es apto para aplicaciones de cara al público sin filtros adicionales.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad en la información disponible.
- La modificación se aplica sobre pesos ya cuantizados, lo que puede degradar la coherencia respecto al modelo original; la model card solo verifica la integridad del transplante, no la calidad resultante.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- El contexto de 262K tokens no está verificado de forma independiente en la información disponible.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante abliterated puede conllevar riesgos legales y reputacionales según la jurisdicción y el caso de uso.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia comunitaria de funcionamiento en producción.
- No se dispone de información sobre parámetros activos, lo que impide estimar con precisión los requisitos de cómputo en inferencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yachiyo8080/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- Modelo base: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Release abliterated referenciada: https://huggingface.co/SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- README en chino: https://huggingface.co/SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF/blob/main/README.zh-CN.md
- Paper referenciado (arXiv:2604.18556): no disponible como enlace verificado en la información proporcionada
- Paper referenciado (arXiv:2605.00649): no disponible como enlace verificado en la información proporcionada
