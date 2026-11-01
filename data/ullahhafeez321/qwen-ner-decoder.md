# ullahhafeez321/Qwen-NER-Decoder

## Resumen

Qwen-NER-Decoder es un adaptador LoRA publicado por el usuario ullahhafeez321 que convierte el modelo base Qwen/Qwen2.5-0.5B-Instruct en un extractor de entidades nombradas (NER) para ingles con salida estructurada en JSON. El modelo reconoce cuatro categorias del esquema CoNLL-2003: PER (persona), ORG (organizacion), LOC (localizacion) y MISC (miscelanea), y devuelve las entidades como un array JSON en lugar de etiquetas BIO, lo que simplifica su integracion en pipelines de extraccion de informacion.

Tecnicamente es un transformer decoder-only de 0,5 mil millones de parametros afinado con LoRA (rank 8, alpha 16, dropout 0,05) sobre las proyecciones de atencion q_proj, k_proj, v_proj y o_proj, durante una sola epoca y con hasta 8.000 muestras de entrenamiento. El repositorio contiene unicamente los pesos del adaptador, no el modelo completo, por lo que debe cargarse junto con el modelo base original mediante PEFT.

Su relevancia es acotada pero practica: demuestra que un modelo pequeno (0,5B) puede resolver una tarea de extraccion estructurada con un coste de entrenamiento minimo (una GPU de Kaggle) y un rendimiento razonable en una muestra reducida. Es util como referencia para quien quiera montar su propio extractor de entidades con recursos limitados, aunque sus metricas proceden de una evaluacion parcial de 100 frases y no de un benchmark completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA |
| Parametros totales | 0,5B en el modelo base; el adaptador LoRA anade un subconjunto no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de inferencia trunca a 1.024 tokens) |
| Tipos de cuantizacion | no disponible (el autor solo menciona FP16 para entrenamiento) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only de la familia Qwen2.5. Sobre el se aplica un ajuste fino con LoRA de rank 8, alpha 16 y dropout 0,05, dirigido exclusivamente a las proyecciones de atencion q_proj, k_proj, v_proj y o_proj. Esto mantiene congelados los pesos originales y entrena un numero reducido de parametros adicionales, lo que permite reproducir el ajuste en hardware modesto.

El entrenamiento se realizo durante una sola epoca sobre hasta 8.000 muestras de entrenamiento y 1.000 de validacion del dataset CoNLL-2003 en su version `lhoestq/conll2003`, con precision FP16, optimizador AdamW y un entorno de GPU de Kaggle. No se documenta el numero total de tokens procesados, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO; el ajuste es exclusivamente supervisado sobre la tarea de extraccion de entidades con formato JSON. La innovacion principal es el formato de salida: en lugar de clasificacion token a token con etiquetas BIO, el modelo genera directamente un array JSON de objetos con los campos `text` y `type`.

## Capacidades

- Extraccion de entidades nombradas en ingles con cuatro categorias: PER, ORG, LOC y MISC.
- Generacion de salida estructurada en JSON, lo que facilita el parseo directo en aplicaciones.
- Capacidad conversacional heredada del modelo base Qwen2.5-0.5B-Instruct, aunque el ajuste esta orientado a la tarea NER.
- Generacion de texto autoregresiva estandar (pipeline `text-generation`).
- No se documenta soporte de tool calling ni function calling especifico para este adaptador.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue: el modelo esta entrenado y evaluado solo en ingles.
- No se documenta modo thinking, vision ni audio.

## Casos de uso

- Extraccion de entidades en articulos de prensa: el modelo recibe un parrafo en ingles y devuelve las personas, organizaciones y localizaciones mencionadas en JSON, listo para indexar en una base de datos o un motor de busqueda.
- Enriquecimiento de registros CRM: a partir de notas o correos en ingles, se extraen nombres de empresas y personas para completar campos estructurados sin intervencion manual.
- Preprocesado para pipelines de RAG: las entidades detectadas pueden usarse como metadatos para filtrar o enlazar documentos antes de la generacion aumentada.
- Construccion de grafos de conocimiento: la salida JSON con tipo de entidad permite generar nodos y aristas de forma directa, por ejemplo personas vinculadas a organizaciones.
- Anonimizacion y seudonimizacion de textos: la deteccion de entidades PER permite localizar nombres propios en documentos en ingles antes de aplicar un proceso de redaccion o sustitucion.
- Prototipado rapido y educacion: al ser un adaptador LoRA sobre un modelo de 0,5B, se puede ejecutar y modificar en una GPU de consumo, lo que lo hace adecuado para experimentar con tecnicas de ajuste eficiente y extraccion de informacion.
- Monitorizacion de menciones de marca: extraer organizaciones y localizaciones de textos en ingles para alimentar paneles de seguimiento de medios.

## Benchmarks y rendimiento

El autor publica una evaluacion sobre un subconjunto de 100 frases en ingles con coincidencia exacta a nivel de entidad. No se trata de un benchmark sobre el conjunto de test completo.

| Metrica | Valor |
|---|---:|
| Precision | 90,40 % |
| Recall | 81,63 % |
| F1-score | 85,79 % |
| Verdaderos positivos | 160 |
| Falsos positivos | 17 |
| Falsos negativos | 36 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 0,5B en FP16, el modelo base ocupa aproximadamente 1 GB de VRAM; con el adaptador LoRA el consumo adicional es minimo. En cuantizacion de 8 bits o 4 bits el requisito baja por debajo de 1 GB, aunque el autor no documenta cuantizaciones probadas.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; el autor entreno en una GPU de Kaggle (entorno con GPU T4 o P100, no especificado).
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers junto con PEFT (metodo documentado por el autor); no se documenta soporte verificado para vLLM, llama.cpp, Ollama o TGI, y al ser un adaptador LoRA requeriria fusionar los pesos con el modelo base para usarlo en algunos de estos motores.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-NER-Decoder (este modelo) | 0,5B + LoRA | no disponible | NER generativo con salida JSON | Apache 2.0 | Adaptador LoRA en HuggingFace |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | no disponible en esta ficha | Modelo base conversacional | Apache 2.0 | Pesos completos en HuggingFace |
| Modelos NER tipo BERT (p. ej. bert-base-NER) | ~110M | 512 tokens | Clasificacion token a token (BIO) | variable segun modelo | Pesos completos en HuggingFace |

La comparacion con modelos NER basados en BERT es cualitativa: el enfoque generativo de este adaptador devuelve JSON directamente, mientras que los modelos tipo BERT requieren postprocesado de etiquetas BIO. No se dispone de datos de rendimiento comparables en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Evaluacion parcial: las metricas provienen de solo 100 frases y el propio autor advierte que no deben interpretarse como un benchmark del conjunto de test completo.
- Entrenamiento minimo: una sola epoca y hasta 8.000 muestras, lo que limita la robustez frente a dominios y estilos de texto alejados de CoNLL-2003 (noticias en ingles).
- Solo ingles: no hay soporte documentado para otros idiomas, a pesar de que el modelo base Qwen2.5 es multilingue.
- Riesgo de alucinacion: al ser un modelo generativo, puede producir entidades inexistentes o JSON mal formado, especialmente con entradas largas o ambiguas; se recomienda validar la salida con un parser y un esquema.
- Esquema cerrado: solo reconoce PER, ORG, LOC y MISC; no cubre categorias como fechas, cantidades, productos o direcciones.
- Dependencia del modelo base: el repositorio contiene unicamente el adaptador LoRA, por lo que es imprescindible cargar Qwen/Qwen2.5-0.5B-Instruct junto con PEFT; no es un modelo autonomo.
- Sin cuantizaciones documentadas: no se han publicado versiones GGUF ni cuantizadas, lo que limita el despliegue en motores como llama.cpp u Ollama sin trabajo adicional de fusion y conversion.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar tambien las condiciones del modelo base y del dataset CoNLL-2003.
- Popularidad nula: cero descargas y cero likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ullahhafeez321/Qwen-NER-Decoder
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset CoNLL-2003 (version usada): https://huggingface.co/datasets/lhoestq/conll2003
