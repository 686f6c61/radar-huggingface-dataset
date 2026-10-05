# zomi-language-ai/nllb-200-distilled-600M-finetuned-zol_Latn-to-en_Latn

## Resumen

Este repositorio contiene un ajuste fino del modelo NLLB-200-distilled-600M de Meta AI, especializado en traduccion automatica del zomi (codigo de idioma zol_Latn) al ingles (en_Latn). El nombre del repositorio indica tanto la arquitectura base como la direccion de traduccion: se trata de un modelo secuencia a secuencia de aproximadamente 600 millones de parametros, derivado de la familia No Language Left Behind, que originalmente cubre 200 idiomas.

La relevancia de este tipo de publicaciones radica en su caracter de recurso para lenguas de bajos recursos. El zomi (tambien conocido como tedim chin o zo) cuenta con millones de hablantes en Birmania, India y la diaspora, pero dispone de pocos recursos digitales y de una cobertura limitada en los sistemas de traduccion comerciales. Un modelo afinado especificamente para este par linguistico permite cubrir una direccion concreta que los sistemas generalistas suelen resolver con calidad desigual.

La ficha publicada por el autor esta practicamente vacia: unicamente declara la licencia cc-by-4.0 y no incluye datos de entrenamiento, evaluacion, composicion del corpus ni instrucciones de uso. El repositorio registra cero descargas y cero interacciones en el momento de la consulta, por lo que no existe validacion externa conocida. Cualquier evaluacion de calidad debe considerarse pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq); arquitectura NLLB-200 distilled, segun el nombre del repositorio |
| Parametros totales | Aproximadamente 600 M (indicado en el nombre del modelo); cifra exacta no disponible en la ficha |
| Parametros activos | No aplica; no es un modelo MoE |
| Longitud de contexto | No disponible en la ficha del autor; el modelo base NLLB-200 aplica un limite de 512 tokens por secuencia |
| Tipos de cuantizacion | No disponibles en la ficha; al ser un modelo denso de ~600 M es cuantizable a int8 e int4 con herramientas externas (CTranslate2, ONNX Runtime, bitsandbytes) |
| Idiomas soportados | Par declarado en el nombre: zol_Latn (zomi) como origen y en_Latn (ingles) como destino. El modelo base cubre 200 idiomas, pero la ficha no documenta que se conserven |
| Licencia | cc-by-4.0 en este repositorio. Advertencia: el modelo base NLLB-200 se distribuye bajo CC-BY-NC-4.0, lo que puede condicionar el uso comercial del derivado |
| Formato de pesos | No disponible; presumiblemente safetensors o PyTorch bin propios de Transformers, pero no se confirma en la informacion proporcionada |

## Arquitectura y entrenamiento

El repositorio se presenta como un ajuste fino ("finetuned") del checkpoint facebook/nllb-200-distilled-600M, un modelo transformer encoder-decoder de aproximadamente 600 millones de parametros obtenido por destilacion de la variante MoE de 54 000 millones de parametros de NLLB-200. La familia NLLB emplea un tokenizador SentencePiece compartido con etiquetas de idioma (forzado de token BOS con el codigo de lengua) para dirigir la traduccion hacia el idioma destino. En este caso, el par declarado es zol_Latn a en_Latn.

No se dispone de ningun dato sobre el procedimiento de ajuste: se desconoce el volumen de pares paralelos utilizados, la composicion del corpus, si hubo filtrado de calidad, si se aplicaron tecnicas de aumento de datos como back-translation, ni si se utilizo aprendizaje supervisado clasico, ajuste con LoRA u otra estrategia. Tampoco hay informacion sobre hiperparametros, numero de pasos, hardware de entrenamiento ni sobre si se congelo alguna parte del modelo base. La model card no documenta ninguna innovacion tecnica adicional mas alla de la herencia de la arquitectura NLLB.

## Capacidades

- Traduccion automatica de zomi (zol_Latn) a ingles (en_Latn). Es la unica capacidad que puede inferirse del nombre del repositorio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte para flujos de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue adicional; el ajuste parece restringir el modelo a un unico par linguistico.
- No se documenta modo de razonamiento explicito, vision, audio ni ninguna capacidad multimodal.
- Al estar basado en NLLB-200, es probable que el modelo conserve la mecanica de tokens de idioma del modelo original, pero la ficha no lo confirma.

## Casos de uso

- Traduccion de documentacion comunitaria: asociaciones de la diaspora zomi pueden traducir avisos, guias de servicios publicos y materiales informativos al ingles para tramites administrativos, aprovechando que el modelo esta especializado en ese par concreto.
- Linguistica de campo y documentacion: investigadores que recopilan corpus en zomi pueden obtener glosas en ingles de forma automatica para acelerar la anotacion, siempre que se revise manualmente el resultado por tratarse de una lengua de bajos recursos.
- Creacion de corpus paralelos: el modelo puede emplearse para generar traducciones sinteticas que, tras filtrado y revision, sirvan para aumentar datos de entrenamiento de otros sistemas de traduccion para el zomi.
- Triaje de contenido en redes sociales: plataformas con usuarios zomi pueden traducir publicaciones al ingles para alimentar clasificadores de moderacion y deteccion de discurso de odio que solo operan en ingles.
- Subtitulado y acceso audiovisual: combinado con un sistema de reconocimiento automatico de voz en zomi, permite generar subtitulos en ingles para videos comunitarios, sermones o material educativo.
- Traduccion de material religioso y educativo: el zomi cuenta con una produccion editorial relevante en contextos eclesiasticos; el modelo puede asistir en la traduccion de himnarios, catecismos y textos formativos.
- Atencion en servicios esenciales: traduccion de prospectos medicos, consentimientos informados o comunicaciones legales para hablantes de zomi que no dominan el ingles, con revision profesional obligatoria dado el riesgo de error.
- Investigacion en traduccion de bajos recursos: banco de pruebas para estudiar estrategias de ajuste fino sobre NLLB en pares con pocos datos paralelos disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras de memoria que se indican a continuacion son estimaciones derivadas del recuento de parametros (~600 M) y no proceden de mediciones publicadas por el autor.

- Pesos en fp32: en torno a 2,4 GB.
- Pesos en fp16 o bf16: en torno a 1,2 GB.
- Pesos en int8: en torno a 0,6 GB.
- Pesos en int4: en torno a 0,3-0,4 GB.
- A las cifras anteriores hay que anadir la memoria de activaciones y la cache del decodificador, que en generacion de secuencias largas puede superar el tamano de los propios pesos.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090 y equivalentes, incluso en fp16.
- Es viable la inferencia en CPU para cargas de trabajo de baja concurrencia, especialmente con cuantizacion int8.
- GPU de centro de datos (A100, H100, L40S) solo se justifican para servir muchas peticiones concurrentes, no por requisitos de memoria.
- Opciones de despliegue: Hugging Face Transformers (referencia), CTranslate2 para inferencia optimizada en CPU y GPU, ONNX Runtime, Text Generation Inference e Inference Endpoints.
- llama.cpp y Ollama no ofrecen soporte nativo para la arquitectura NLLB, por lo que no son una via de despliegue directa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zomi-language-ai/nllb-200-distilled-600M-finetuned-zol_Latn-to-en_Latn | ~600 M (indicado) | 1 par declarado (zol_Latn a en_Latn) | no disponible | cc-by-4.0 en el repositorio | Hugging Face, 0 descargas |
| facebook/nllb-200-distilled-600M (modelo base) | ~600 M | 200 idiomas | 512 tokens por secuencia | CC-BY-NC-4.0 | Hugging Face, ampliamente utilizado |
| facebook/m2m100_418M | ~418 M | 100 idiomas | 1024 tokens | MIT | Hugging Face, muy extendido |
| facebook/mbart-large-50 | ~610 M | 50 idiomas | 1024 tokens | MIT | Hugging Face, muy extendido |

Nota: los datos de los tres modelos comparativos proceden de conocimiento general sobre sus repositorios originales y no han sido verificados en la informacion proporcionada; conviene confirmarlos en las fichas oficiales antes de citarlos. No existe ninguna comparacion de calidad de traduccion publicada para este ajuste concreto frente a las alternativas.

## Limitaciones y advertencias

- La model card no contiene informacion sobre datos de entrenamiento, por lo que se desconocen los sesgos presentes en el corpus y su posible amplificacion en las traducciones.
- Riesgo de alucinacion y de omision de contenido: en traduccion automatica de lenguas de bajos recursos es frecuente que el modelo invente segmentos o repita texto cuando la entrada se aleja de la distribucion de entrenamiento.
- Cobertura limitada a un unico par linguistico y a una unica direccion; no sirve para traducir hacia el zomi ni para otros idiomas.
- Al no haber datos de evaluacion, no puede afirmarse ninguna mejora respecto al modelo base NLLB-200-distilled-600M en este par.
- Inconsistencia de licencia: el repositorio declara cc-by-4.0, pero el modelo base NLLB-200 se distribuye bajo CC-BY-NC-4.0, que prohibe el uso comercial. Esta discrepancia debe resolverse antes de cualquier explotacion comercial.
- Ausencia total de validacion comunitaria: cero descargas y cero likes en el momento de la consulta, sin issues ni discusiones que respalden la calidad del ajuste.
- No se documentan limitaciones de longitud de entrada mas alla del limite hereditario del modelo base, ni el comportamiento con entradas muy cortas o con mezcla de codigos.
- La ortografia del zomi no esta estandarizada de forma universal; variaciones dialectales o de transcripcion pueden degradar notablemente la calidad de la traduccion.
- Uso en contextos sensibles (medico, legal, asilo) requiere revision humana obligatoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zomi-language-ai/nllb-200-distilled-600M-finetuned-zol_Latn-to-en_Latn
- Modelo base NLLB-200-distilled-600M: https://huggingface.co/facebook/nllb-200-distilled-600M
- Paper de NLLB-200 (No Language Left Behind): https://arxiv.org/abs/2207.04672
- Repositorio de referencia de NLLB en GitHub: https://github.com/facebookresearch/fairseq/tree/nllb
- Modelo comparable M2M-100: https://huggingface.co/facebook/m2m100_418M
- Modelo comparable mBART-50: https://huggingface.co/facebook/mbart-large-50

No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos especificos de este ajuste.
