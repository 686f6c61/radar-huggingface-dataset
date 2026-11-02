# Ugiat/madlad400-3b-mt-ast-an-oc_aranes-ct2

## Resumen

Este repositorio contiene una conversión a CTranslate2 en cuantización int8_float16 del modelo `Ugiat/madlad400-3b-mt-ast-an-oc_aranes`, un fine-tune de `google/madlad400-3b-mt` orientado a la traducción automática hacia asturiano (`<2ast>`), aragonés (`<2an>`) y aranés (`<2oc_aranes>`), y desde estas lenguas hacia castellano, catalán, inglés y francés. El trabajo lo firma Ugiat Technologies como desarrollo independiente, sin vinculación con el proyecto TAN-IBE, Google ni los autores de MADLAD-400.

El modelo resuelve un problema muy concreto: la cobertura deficiente de lenguas minoritarias o de bajos recursos en los sistemas de traducción neuronales de gran escala. MADLAD-400, al ser un modelo multilingüe masivo entrenado sobre datos web, ofrece un rendimiento desigual en asturiano, aragonés y aranés; este fine-tune refuerza esos pares lingüísticos manteniendo las etiquetas de destino del modelo base.

La relevancia de esta variante concreta es operativa: al estar convertida a CTranslate2 con pesos int8_float16 (2,9 GB), permite servir traducción en CPU o en GPU con menos memoria y mayor throughput que la versión original en transformers, lo que la hace apta para despliegues de producción con presupuesto de hardware limitado. La arquitectura subyacente es la de MADLAD-400-3B-MT: un transformer encoder-decoder de aproximadamente 3.000 millones de parámetros con atención multi-cabeza estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MADLAD-400-3B-MT), convertido a CTranslate2 |
| Parametros totales | Aproximadamente 3.000 millones (modelo base MADLAD-400-3B-MT) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8_float16 (GPU), int8 (CPU); pesos de 2,9 GB |
| Idiomas soportados | ast, an, oc (aranés), es, ca, en, fr, multilingual |
| Licencia | Apache-2.0 |
| Formato de pesos | CTranslate2 (modelo convertido), tokenizer SentencePiece de transformers 4.x |

## Arquitectura y entrenamiento

El modelo base es MADLAD-400-3B-MT, un transformer encoder-decoder multilingüe entrenado por Google sobre un corpus web masivo (el paper de Kudugunta et al., 2023, describe el conjunto de datos y el procedimiento). La etiqueta de idioma de destino se antepone al texto de entrada en forma de token especial (`<2ast>`, `<2an>`, `<2oc_aranes>`, `<2es>`, `<2ca>`, `<2en>`, `<2fr>`), mecanismo heredado del modelo original.

El fine-tune de Ugiat parte de ese checkpoint y lo especializa en los tres idiomas de destino de bajos recursos, manteniendo las etiquetas del modelo base para el resto de direcciones. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card remite a la ficha del modelo principal para los datos de entrenamiento y sus licencias, incluyendo los corpus de TAN-IBE. La conversión a CTranslate2 se realizó con CTranslate2 4.8.2 y transformers 4.57.6 (la versión 5.x no carga correctamente los checkpoints MADLAD-400).

## Capacidades

- Traducción automática hacia asturiano, aragonés y aranés desde castellano, catalán, inglés y francés.
- Traducción desde esos tres idiomas hacia castellano, catalán, inglés y francés mediante las etiquetas del modelo base.
- Traducción multilingüe general con las etiquetas nativas de MADLAD-400 (por ejemplo `<2fr>`, `<2de>`, `<2en>`).
- Procesamiento por lotes (`translate_batch`) con búsqueda en haz configurable (beam_size=4 en el ejemplo del autor).
- Ejecución en CPU (int8) y en GPU (int8_float16).
- No se documentan capacidades de tool calling, agentes, visión ni audio; es un modelo exclusivamente de traducción.

## Casos de uso

- Traducción de documentación administrativa al asturiano: el modelo permite verter textos oficiales del castellano al asturiano con la etiqueta `<2ast>`, útil para ayuntamientos y administraciones que publican en lengua cooficial.
- Localización de contenidos web al aragonés: integrable en un pipeline de CMS que traduzca artículos del castellano con `<2an>` antes de la revisión humana.
- Traducción al aranés en el ámbito del Valle de Arán: el tag `<2oc_aranes>` cubre la variante aranesa del occitano, poco representada en modelos generalistas.
- Servicio de traducción en CPU de bajo coste: la cuantización int8 y el formato CTranslate2 permiten desplegar el modelo en servidores sin GPU, con latencia adecuada para volúmenes moderados.
- Traducción inversa para análisis de contenido: convertir textos en asturiano, aragonés o aranés a castellano o inglés con las etiquetas `<2es>` y `<2en>` para su indexación o moderación.
- Procesamiento por lotes de corpus: la API `translate_batch` de CTranslate2 facilita traducir grandes volúmenes de frases en paralelo con beam search configurable.
- Integración en aplicaciones de escritorio o edge: el tamaño de 2,9 GB y la ejecución en CPU permiten empaquetar el traductor en entornos sin acelerador dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la ficha del modelo principal (`Ugiat/madlad400-3b-mt-ast-an-oc_aranes`) para la evaluación comparativa con otros modelos, pero los datos concretos no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: los pesos int8_float16 ocupan 2,9 GB; con overhead de runtime y buffers de atención, se recomienda al menos 4-6 GB de VRAM para GPU.
- GPU recomendadas: cualquier GPU con 6 GB o más, como RTX 3060, RTX 4060, RTX 4090, A100 o H100; el modelo no requiere memoria de gama alta.
- CPU: la variante int8 está pensada para servir en CPU; se recomienda un número de hilos acorde con los núcleos disponibles (CTranslate2 escala con `inter_threads` e `intra_threads`).
- Despliegue: CTranslate2 4.x es el runtime nativo; también puede servirse mediante el servidor de CTranslate2 o envolverse en APIs propias. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Nota de compatibilidad: las wheels de CTranslate2 4.x se compilan para CUDA 12; en entornos con solo CUDA 13 hay que instalar `nvidia-cublas-cu12` y asegurar que `libcublas.so.12` sea cargable.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas de destino | Formato | Licencia |
|---|---|---|---|---|---|
| Ugiat/madlad400-3b-mt-ast-an-oc_aranes-ct2 | ~3.000 M | No disponible | ast, an, oc_aranes (+ base) | CTranslate2 int8 | Apache-2.0 |
| Ugiat/madlad400-3b-mt-ast-an-oc_aranes | ~3.000 M | No disponible | ast, an, oc_aranes (+ base) | transformers (safetensors) | Apache-2.0 |
| google/madlad400-3b-mt | ~3.000 M | No disponible | Multilingüe general (400+ idiomas) | transformers | Apache-2.0 |
| NLLB-200 (variantes de 1.300 M y 3.300 M) | 1.300-3.300 M | No disponible | Multilingüe general | transformers | CC-BY-NC (no comercial) |

La diferencia clave frente al modelo base de Google es la especialización en asturiano, aragonés y aranés, a costa de un rendimiento potencialmente menor en el resto de lenguas. Frente a NLLB-200, la licencia Apache-2.0 de MADLAD-400 permite uso comercial sin las restricciones no comerciales de NLLB.

## Limitaciones y advertencias

- Es un fine-tune independiente: no está producido, revisado ni respaldado por el proyecto TAN-IBE, Google ni los autores de MADLAD-400.
- Riesgo de alucinación y de traducciones incorrectas en frases largas o con terminología especializada, especialmente en las lenguas de bajos recursos.
- La cobertura de asturiano, aragonés y aranés depende de la calidad y cantidad de los corpus de entrenamiento; no se detalla su composición en la información disponible.
- El modelo está pensado para traducción; no debe emplearse como modelo generativo general.
- La conversión requiere transformers 4.x; la versión 5.x no carga correctamente los checkpoints MADLAD-400.
- En GPU con CUDA 13 es necesario instalar `nvidia-cublas-cu12` y garantizar la carga de `libcublas.so.12` antes de importar CTranslate2.
- Aunque la licencia es Apache-2.0, las licencias de los datos de entrenamiento (incluidos los corpus de TAN-IBE) se detallan en la ficha del modelo principal y deben revisarse antes de un uso comercial.
- No se documentan evaluaciones de sesgo ni de robustez para este fine-tune concreto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ugiat/madlad400-3b-mt-ast-an-oc_aranes-ct2
- Modelo principal (transformers): https://huggingface.co/Ugiat/madlad400-3b-mt-ast-an-oc_aranes
- Modelo base de Google: https://huggingface.co/google/madlad400-3b-mt
- Paper de MADLAD-400 (Kudugunta et al., 2023): https://arxiv.org/abs/2309.04662
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Contacto del autor: ugiat@ugiat.com
