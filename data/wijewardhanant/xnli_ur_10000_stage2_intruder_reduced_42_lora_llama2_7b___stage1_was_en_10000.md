# WijewardhanaNT/xnli_ur_10000_stage2_intruder_reduced_42_LoRA_llama2_7B___stage1_was_en_10000

## Resumen

Adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base meta-llama/Llama-2-7b-hf y publicado por el usuario WijewardhanaNT en HuggingFace bajo la librería PEFT. No se trata de un modelo completo, sino de un conjunto de pesos de bajo rango que deben cargarse junto al modelo base de 7.000 millones de parámetros para poder ejecutarse. El repositorio ocupa 0,2 GB y no registra descargas ni valoraciones en el momento de la consulta.

El identificador del repositorio sugiere un experimento de inferencia de lenguaje natural cross-lingual sobre el corpus XNLI (Cross-lingual Natural Language Inference), con 10.000 ejemplos en urdú en una segunda etapa de entrenamiento y una primera etapa sobre 10.000 ejemplos en inglés. Los términos «intruder_reduced» y «42» apuntan a una variante de reducción de interferencia entre adaptadores y a una semilla fija, un patrón habitual en estudios de composición y mezcla de adaptadores LoRA. Esta interpretación procede únicamente de la convención de nombres y no está confirmada por el autor en la model card.

La relevancia del artefacto es, por tanto, fundamentalmente de investigación: sirve como material reproducible para estudiar transferencia cross-lingual, olvido catastrófico y solapamiento entre adaptadores en lenguas de bajos recursos. La model card publicada es la plantilla por defecto de HuggingFace sin cumplimentar, por lo que no hay información oficial sobre datos de entrenamiento, hiperparámetros, licencia ni evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) con adaptador LoRA de bajo rango |
| Parametros totales | 6.740 millones en el modelo base; parametros del adaptador: no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens (heredada del modelo base Llama-2-7b) |
| Tipos de cuantizacion | Adaptador distribuido en safetensors; precision original no especificada. El modelo base admite fp16, int8 y cuantizaciones de 4 bits (GPTQ, AWQ, GGUF) |
| Idiomas soportados | No disponible en la ficha; el identificador del repositorio sugiere urdu e ingles |
| Licencia | No disponible. El modelo base se distribuye bajo Llama 2 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar meta-llama/Llama-2-7b-hf |

## Arquitectura y entrenamiento

El modelo subyacente, Llama-2-7b, es un transformer decoder-only de 6.740 millones de parametros con 32 capas, dimension oculta de 4.096, 32 cabezas de atencion, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). Su vocabulario es de 32.000 tokens y fue preentrenado sobre aproximadamente 2 billones de tokens, con un contexto maximo de 4.096 tokens. El adaptador es un artefacto LoRA: congela los pesos del modelo base e inyecta matrices de bajo rango en determinadas proyecciones, lo que reduce drasticamente el numero de parametros entrenables.

No hay informacion publicada sobre el procedimiento de entrenamiento: se desconocen el rango y alpha del LoRA, los modulos objetivo, la tasa de aprendizaje, el numero de pasos, la composicion exacta de los datos ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Por la nomenclatura del repositorio cabe inferir un esquema de dos etapas (primera en ingles, segunda en urdu) sobre XNLI, posiblemente con algun metodo de reduccion de interferencia entre adaptadores, pero se trata de una hipotesis no verificada. La unica referencia tecnica incluida en las etiquetas, arXiv:1910.09700, corresponde al articulo de Lacoste et al. sobre calculo de emisiones de carbono y aparece en la plantilla de model card, no como descripcion del entrenamiento.

## Capacidades

- Generacion de texto autoregresiva en ingles y otras lenguas, heredada del modelo base Llama-2-7b.
- El adaptador esta orientado, segun la convencion de nombres, a inferencia de lenguaje natural (NLI) sobre XNLI, con foco en urdu.
- No hay documentacion que confirme soporte de tool calling ni function calling.
- No hay documentacion que confirme capacidad de agentes o razonamiento multi-paso.
- No dispone de vision, audio ni otras modalidades: es un adaptador de texto sobre un modelo exclusivamente textual.
- No se documenta modo de razonamiento explicito (thinking mode) ni capacidades especiales adicionales.
- Cualquier capacidad del modelo base que se haya visto degradada durante el ajuste LoRA no esta cuantificada.

## Casos de uso

- Reproduccion de experimentos de transferencia cross-lingual: el adaptador permite repetir un flujo ingles a urdu sobre XNLI y comparar el efecto de la segunda etapa de ajuste frente a partidas desde cero.
- Estudio de interferencia entre adaptadores: los terminos «intruder_reduced» del identificador sugieren un diseno para medir y mitigar el solapamiento entre representaciones aprendidas en distintas etapas, un caso de uso directo en investigacion sobre composicion de adaptadores.
- Analisis de olvido catastrofico: cargando el adaptador sobre Llama-2-7b se puede medir la degradacion en tareas generales de generacion en ingles y contrastarla con el modelo base sin adaptar.
- Punto de partida para clasificacion NLI en urdu: un equipo que necesite un clasificador de inferencia textual en urdu puede continuar el ajuste con sus propios datos etiquetados, aprovechando el adaptador como inicializacion.
- Evaluacion de tecnicas de mezcla de pesos (task arithmetic, TIES, DARE): al ser un adaptador pequeno y aislado, es util como pieza en experimentos de combinacion de multiples LoRA.
- Auditoria de sesgos y cobertura en lenguas de bajos recursos: sirve para documentar como se comporta un ajuste en urdu sobre un modelo predominantemente anglocentrico y que sesgos persisten.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion cumplimentada, y el repositorio no registra descargas ni evaluaciones de terceros.

## Requisitos de hardware

- VRAM estimada para el modelo base a precision fp16: aproximadamente 14 GB solo de pesos, entre 16 y 20 GB considerando cache KV con contexto de 4.096 tokens y overhead de ejecucion.
- VRAM estimada en cuantizacion int8: del orden de 8 a 10 GB.
- VRAM estimada en cuantizacion de 4 bits: del orden de 5 a 7 GB.
- El adaptador LoRA en si ocupa una fraccion minima del repositorio de 0,2 GB y anade un consumo despreciable.
- GPU recomendadas para fp16: A100 40 GB, H100 80 GB, RTX 4090 o RTX 3090 (24 GB). Para 4 bits es suficiente una RTX 3060 de 12 GB o una RTX 4070.
- Cabe en GPU de consumo: si, en RTX 3090/4090 a fp16 y en practicamente cualquier GPU con 8 GB o mas utilizando cuantizacion de 4 bits.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador, vLLM (soporta adaptadores LoRA), HuggingFace TGI (soporta LoRA), llama.cpp u Ollama previa fusion del adaptador con el modelo base y conversion a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los datos de las alternativas proceden de su documentacion publica, no de la informacion proporcionada sobre este repositorio.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este adaptador (sobre Llama-2-7b) | 6.740 M en el base; adaptador no especificado | 4.096 tokens | No disponible (base: Llama 2 Community License) | Adaptador de investigacion sin evaluacion publicada; 0 descargas |
| meta-llama/Llama-2-7b-hf (modelo base) | 6.740 M | 4.096 tokens | Llama 2 Community License | Modelo completo con evaluacion publicada por Meta; disponible comercialmente con restricciones |
| meta-llama/Llama-3.1-8B | 8.030 M | 128.000 tokens | Llama 3.1 Community License | Contexto muy superior y mejor rendimiento general; mismo ecosistema de herramientas |
| mistralai/Mistral-7B-v0.1 | 7.240 M | 32.000 tokens | Apache 2.0 | Licencia permisiva sin restricciones de uso comercial y contexto ocho veces mayor |

## Limitaciones y advertencias

- La model card es la plantilla por defecto sin rellenar: no hay informacion verificada sobre datos, entrenamiento, evaluacion ni uso previsto.
- La licencia no esta declarada en el repositorio, lo que genera incertidumbre legal para cualquier uso que no sea de investigacion.
- Al derivar de Llama-2-7b, el uso queda sujeto a la Llama 2 Community License, incluida su politica de uso aceptable y el requisito de aceptar los terminos de Meta.
- No se conoce el rango ni los modulos objetivo del LoRA, por lo que no se puede garantizar su correcta carga con configuraciones distintas a las del autor.
- El ajuste sobre una tarea concreta (presumiblemente NLI) puede degradar las capacidades generales de generacion del modelo base, sin que existan mediciones publicadas del alcance de ese olvido.
- El modelo base Llama-2-7b presenta riesgo de alucinacion, sesgos de genero, raza y religion, y un rendimiento notablemente inferior en lenguas distintas del ingles; no hay evidencia de que el adaptador corrija estos problemas en urdu.
- El contexto esta limitado a 4.096 tokens, insuficiente para tareas de documentacion larga o conversaciones multi-turno extensas.
- El repositorio registra 0 descargas y 0 valoraciones: no ha sido validado por terceros y carece de soporte.
- Se trata de un artefacto de investigacion, no de un modelo listo para produccion; se recomienda evaluarlo en el dominio objetivo antes de cualquier despliegue.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/WijewardhanaNT/xnli_ur_10000_stage2_intruder_reduced_42_LoRA_llama2_7B___stage1_was_en_10000
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Libreria PEFT: https://huggingface.co/docs/peft
- Referencia citada en las etiquetas (Lacoste et al., 2019, sobre estimacion de emisiones): https://arxiv.org/abs/1910.09700
- No se han encontrado otros enlaces (papers, demos o repositorios) asociados a este adaptador en la informacion disponible.
