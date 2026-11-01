# tinyopsec/Jeesup-svd-safety-l3_swift_jbbcal2_remove50-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF del modelo `Jeesup/svd-safety-l3_swift_jbbcal2_remove50`, un checkpoint comprimido mediante Swift-SVD a partir de Llama-3-8B-Instruct, publicado por el usuario tinyopsec en HuggingFace. El modelo base conserva aproximadamente el 50 % de los parámetros densos del original (unos 8.030 millones de parámetros frente a los ~8.030 millones declarados en safetensors, resultado de la compresión SVD con recuperación posterior vía LoRA), y su cuantización a GGUF permite ejecutarlo en CPU y en GPUs de consumo mediante llama.cpp y runtimes compatibles.

No se trata de un asistente de propósito general: según la model card del autor, es un artefacto de investigación procedente de un estudio sobre compresión SVD y sus compromisos con la seguridad (safety trade-offs). Varias variantes de la rejilla experimental están deliberadamente degradadas en cuanto a alineación y seguridad, por lo que el propio autor recomienda evaluarlo antes de cualquier uso. Su relevancia actual es principalmente académica: sirve para estudiar cómo la compresión por descomposición en valores singulares afecta al comportamiento de seguridad de los modelos derivados de Llama 3.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3) comprimido con Swift-SVD y recuperación LoRA |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 3 8B Instruct, presumiblemente 8.192 tokens) |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Meta Llama 3 Community License |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo es un checkpoint derivado de Llama-3-8B-Instruct al que se ha aplicado compresión Swift-SVD: las matrices de pesos densos se aproximan mediante descomposición en valores singulares, reteniendo el 50 % de los parámetros densos originales. Tras la compresión se emplea una recuperación con LoRA (low-rank adaptation) para restaurar parte de la capacidad perdida durante la reducción de rango. El resultado conserva la arquitectura transformer decoder estándar de Llama 3, pero con matrices de pesos de rango reducido.

No se dispone de información sobre los datos de entrenamiento específicos del ajuste, el número de tokens, ni sobre el uso de RLHF o DPO en esta derivación. El nombre del checkpoint sugiere que el experimento involucra los benchmarks de seguridad JBBCAL y un componente "swift" (posiblemente relacionado con el dataset de instrucciones Swift-Alignment), aunque la model card no lo detalla. La innovación técnica destacable es la propia combinación de compresión SVD agresiva (50 % de reducción) con recuperación LoRA, evaluada en un estudio de compromisos entre compresión y seguridad.

## Capacidades

- Generación de texto conversacional heredada de Llama-3-8B-Instruct, con capacidades degradadas de forma variable según el grado de compresión y los objetivos del estudio de seguridad
- Capacidades de razonamiento, código y matemáticas de Llama 3 8B Instruct, presumiblemente reducidas respecto al modelo original por la compresión al 50 % de parámetros
- Ejecución local mediante cualquier runtime compatible con GGUF (llama.cpp, Ollama, LM Studio, koboldcpp)
- No se ha documentado soporte de tool calling, function calling, agentes, visión ni audio
- No se han documentado capacidades multilingües específicas para esta derivación

## Casos de uso

- Investigación en compresión de modelos: permite estudiar en local cómo la descomposición SVD al 50 % afecta al comportamiento de un LLM de 8B, con un coste de despliegue mínimo gracias a GGUF
- Estudios de safety alignment: el modelo forma parte de una rejilla experimental con variantes deliberadamente degradadas en seguridad, útil para investigar la relación entre compresión y pérdida de alineación
- Benchmarking de runtimes GGUF: al ofrecer 13 niveles de cuantización (de F16 a Q2_K), sirve como carga de trabajo realista para comparar rendimiento de llama.cpp, Ollama o LM Studio en distintas configuraciones de hardware
- Evaluación de recuperación LoRA post-compresión: permite medir cuánta capacidad se restaura mediante adaptadores de bajo rango tras una compresión agresiva
- Prototipado de pipelines de compresión: puede integrarse como caso de referencia en flujos de trabajo que combinen SVD y LoRA sobre modelos Llama 3
- Análisis comparativo de degradación por cuantización: la coexistencia de cuantizaciones de 2 a 16 bits facilita estudios sobre interacción entre compresión SVD y cuantización posterior

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el archivo F16 ocupa 16,1 GB; las cuantizaciones Q4_K_M y Q5_K_M se sitúan aproximadamente entre 4,5 y 6 GB, y Q2_K por debajo de 3 GB (estimaciones basadas en los tamaños típicos de GGUF para 8B parámetros; el tamaño total del repositorio es de 77,6 GB)
- GPUs recomendadas: cualquier GPU de consumo con 6-8 GB de VRAM (RTX 3060, RTX 4060) para cuantizaciones de 4-5 bits; no se requieren GPUs de centro de datos
- Cabe en GPUs de consumo: sí, incluso en portátiles con GPU modesta usando Q3 o Q2; también ejecutable en CPU pura con RAM suficiente
- Opciones de despliegue: llama.cpp (ejemplo documentado: `./llama-cli -m model-Q4_K_M.gguf -p "prompt" -n 256`), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF
- Latencia y throughput: no disponible

## Comparativa con modelos similares

| Modelo | Parámetros | Compresión | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup-svd-safety-l3 (este) | 8.030 M (50 % SVD + LoRA) | Swift-SVD 50 % | no disponible | Llama 3 Community | GGUF, 13 cuantizaciones |
| Meta Llama-3-8B-Instruct | 8.030 M (denso) | Ninguna | 8.192 | Llama 3 Community | safetensors, GGUF comunitarios |
| PrunaAI / derivaciones SVD de Llama 3 8B | ~8.000 M comprimidos | Variable | no disponible | Variable | no disponible |

La comparación más relevante es con el modelo base Llama-3-8B-Instruct: este derivado conserva el mismo número declarado de parámetros en safetensors pero con matrices de rango reducido al 50 %, a costa de una seguridad deliberadamente degradada en algunas variantes. Datos comparativos de rendimiento no disponibles.

## Limitaciones y advertencias

- El propio autor advierte que varias variantes de la rejilla experimental están deliberadamente degradadas en seguridad: el modelo puede responder a contenido que un modelo alineado rechazaría
- No es un asistente de propósito general; es un artefacto de investigación que requiere evaluación previa a cualquier uso
- Riesgo de alucinación: no disponible de forma específica, pero inherente a modelos de 8B comprimidos al 50 % de parámetros
- La compresión SVD agresiva probablemente degrada razonamiento, código y matemáticas respecto a Llama-3-8B-Instruct original; no hay benchmarks que cuantifiquen la pérdida
- Idiomas soportados, longitud de contexto efectiva y capacidades de tool calling no documentadas
- Licencia: Meta Llama 3 Community License; el uso de este derivado está sujeto a la licencia del modelo original, con sus restricciones de uso aceptable y requisitos de atribución
- Tamaño del repositorio (77,6 GB): descargar solo los archivos GGUF necesarios
- Baja tracción comunitaria (524 descargas, 0 likes en el momento de la ficha): escaso soporte y validación externa

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/tinyopsec/Jeesup-svd-safety-l3_swift_jbbcal2_remove50-GGUF
- Modelo base: https://huggingface.co/Jeesup/svd-safety-l3_swift_jbbcal2_remove50
- Otros enlaces (paper, blog, demo): no disponibles
