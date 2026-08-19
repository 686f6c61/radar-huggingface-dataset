# SurjoLabs/sarvam-translate-en-bn-merged

## Resumen

SurjoLabs/sarvam-translate-en-bn-merged es un modelo de traducción automática neuronal especializado en el par inglés-bengalí, publicado por SurjoLabs. Se trata de un merge (fusión de pesos) del modelo Sarvam Translate de Sarvam AI, que a su vez está construido sobre Gemma3-4B-IT, un modelo de lenguaje de 4.000 millones de parámetros desarrollado por Google. El modelo resultante tiene 4.300.079.472 parámetros y se distribuye en formato safetensors con un tamaño de repositorio de 8,6 GB.

La relevancia de este modelo radica en que cubre un par de idiomas con recursos limitados (inglés-bengalí) y está diseñado para traducción a nivel de documento, no solo de frases aisladas. Aunque la model card original está prácticamente vacía y no se proporcionan detalles de entrenamiento, el modelo se enmarca en la línea de Sarvam Translate, que busca ofrecer traducciones de alta calidad para las 22 lenguas oficiales de la India. Este merge concreto parece estar adaptado específicamente para el par inglés-bengalí, probablemente mediante una fusión de pesos con un modelo afinado para esa dirección.

Dado que la documentación es escasa, gran parte de los datos técnicos (contexto, licencia, benchmarks) no están disponibles. La ficha siguiente recoge únicamente la información verificable y marca explícitamente lo que no se conoce.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (derivado de Gemma3-4B-IT, no confirmado en la model card) |
| Parametros totales | 4.300.079.472 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base Gemma3-4B soporta 128k, pero no se confirma para este merge) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles y bengali (segun el nombre del modelo) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni el proceso de entrenamiento de este modelo. La model card de HuggingFace esta vacia en todas las secciones tecnicas. Por la informacion publica de Sarvam AI, el modelo original Sarvam Translate se basa en Gemma3-4B-IT, que es un transformer decoder con atencion por ventanas deslizantes y atencion global alternada, disenado por Google. Este merge probablemente hereda esa arquitectura, pero no hay confirmacion oficial.

En cuanto al entrenamiento, no se especifican datos sobre el volumen de tokens, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO. El nombre "merged" sugiere que se ha realizado una fusion de pesos entre el modelo base y un afinamiento especifico para ingles-bengali, pero el metodo exacto (por ejemplo, SLERP, TIES, DARE) no se documenta.

## Capacidades

- Traduccion automatica de texto entre ingles y bengali, orientada a documentos completos mas que a frases sueltas.
- Manejo de entradas largas (si conserva el contexto de Gemma3-4B, hasta 128k tokens, aunque no esta confirmado).
- Generacion de texto en formato conversacional (el modelo base Gemma3-4B-IT esta optimizado para chat).
- Posible soporte de entrada multimodal (el tag "image-text-to-text" aparece en HuggingFace, pero no hay evidencia de que este merge lo conserve; probablemente es un residuo del tag del modelo base).
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documentan capacidades multilingues mas alla del par ingles-bengali.

## Casos de uso

- Traduccion de documentos legales y administrativos: el modelo puede traducir contratos, certificados o formularios oficiales del ingles al bengali, manteniendo la estructura del documento gracias a su capacidad de procesar contexto largo.
- Atencion al cliente bilingue: integrado en un chatbot, puede traducir consultas de clientes bengalies al ingles para que un agente hispanohablante o angloparlante las entienda, y viceversa.
- Localizacion de software y aplicaciones: traducir cadenas de interfaz, mensajes de error y documentacion tecnica del ingles al bengali, acelerando el despliegue de productos en Bangladesh y la region de Bengala Occidental.
- Educacion y e-learning: convertir materiales educativos (apuntes, examenes, guias) del ingles al bengali para estudiantes que no dominan el ingles academico.
- Traduccion de contenido editorial: traducir articulos, blogs o noticias del ingles al bengali para ampliar la audiencia en medios digitales regionales.
- Investigacion y acceso a literatura tecnica: traducir papers o documentacion tecnica del ingles al bengali para facilitar la difusion del conocimiento en comunidades cientificas locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, BLEU, COMET ni otras metricas de traduccion para este modelo concreto. El modelo original Sarvam Translate tampoco publica cifras comparativas en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.300 millones de parametros, en precision fp16 ocupa aproximadamente 8,6 GB de memoria. Con cuantizacion de 8 bits (INT8) se reduce a unos 4,3 GB, y con 4 bits (INT4) a unos 2,2 GB, aunque estas cuantizaciones no estan oficialmente publicadas para este modelo.
- GPU recomendadas: una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060, RTX 4070, A10) puede ejecutar el modelo en fp16. Para cuantizaciones inferiores, una GPU de 8 GB (RTX 3050, RTX 4060) seria suficiente.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de gama media y alta de consumo gracias a su tamano moderado.
- Opciones de despliegue: compatible con la libreria transformers de HuggingFace, y puede servirse con Text Generation Inference (TGI) o vLLM si se convierte al formato adecuado. Para CPU, se puede convertir a GGUF y usar llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles. Al ser un modelo de 4B parametros, se espera una latencia de decenas de milisegundos por token en una GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SurjoLabs/sarvam-translate-en-bn-merged | 4,3B | no disponible | ingles, bengali | no disponible | HuggingFace |
| Sarvam Translate (sarvamai/sarvam-translate) | 4,3B (Gemma3-4B-IT) | 128k (base) | 22 lenguas indias | no disponible | HuggingFace |
| NLLB-200 (3.3B) | 3,3B | 512 tokens | 200 idiomas | CC-BY-NC | HuggingFace |
| Gemma3-4B-IT (base) | 4,0B | 128k | multilingue | Gemma Terms | HuggingFace |

El modelo de SurjoLabs se diferencia de Sarvam Translate original en que esta especificamente enfocado al par ingles-bengali, probablemente con un ajuste adicional. Frente a NLLB-200, ofrece un contexto mucho mayor (si hereda los 128k de Gemma3) pero cubre solo dos idiomas. La licencia de NLLB-200 es no comercial, mientras que la de este modelo no esta especificada.

## Limitaciones y advertencias

- La model card no proporciona ninguna informacion sobre sesgos, riesgos o limitaciones. Es un modelo publicado sin documentacion tecnica.
- La licencia no esta especificada, lo que impide conocer si puede usarse en aplicaciones comerciales. Se recomienda contactar con el autor antes de cualquier despliegue productivo.
- No hay datos sobre la calidad de la traduccion ni benchmarks publicados, por lo que el rendimiento real es desconocido.
- Al ser un merge, podria heredar comportamientos indeseados del proceso de fusion de pesos, como degradacion en ciertos dominios o alucinaciones en traducciones largas.
- El soporte de idiomas se limita al par ingles-bengali; no debe usarse para otros pares sin validacion previa.
- El tag "image-text-to-text" sugiere que el modelo base podria tener capacidades multimodales, pero no hay evidencia de que este merge las conserve. No se recomienda asumir esa funcionalidad.
- No se ha verificado si el modelo conserva la ventana de contexto de 128k de Gemma3-4B; en caso de no conservarla, el rendimiento en documentos largos podria verse afectado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SurjoLabs/sarvam-translate-en-bn-merged
- Modelo original Sarvam Translate: https://huggingface.co/sarvamai/sarvam-translate
- Documentacion de Sarvam API (Sarvam Translate): https://docs.sarvam.ai/api/getting-started/models/sarvam-translate
- Ficha en AI Kosh (India AI): https://aikosh.indiaai.gov.in/home/models/details/sarvamtranslate.html
