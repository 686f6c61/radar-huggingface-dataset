# whiskeywhiskey/waldo-1b-initial-reference

## Resumen

WALDO 1B initial reference es un checkpoint experimental de pesos de un modelo de lenguaje causal de tipo base, publicado por el usuario whiskeywhiskey bajo licencia Apache 2.0. Se trata de un artefacto de referencia pensado para reproducir los experimentos de entrenamiento y evaluacion del proyecto WALDO, no un modelo listo para produccion. El autor indica explicitamente que la cualificacion conductual congelada no se supero y que el modelo no ha pasado por ajuste de instrucciones, por lo que persisten derivas de personaje, de tema y errores factuales.

El modelo gestiona el identificador interno `general-base-1b-a-tuned-01`, con una ejecucion nativa `5652ba3bce3a7f6c` y un checkpoint seleccionado en la posicion 271073 dentro de la etapa. El artefacto ocupa 4.138.071.392 bytes (unos 4,1 GB) con SHA-256 `f3159fa6b8be2acd8efbc0d9daebeba59dcaf2f1f9ed47ff925f656a187028cb`, y reporta una perdida de validacion en inferencia FP32 de 2,195388929 y 0,799569705 bits por byte. La etapa se completo con 295.716 pasos sobre un objetivo de 4.845.010.944 tokens, con una posicion de snapshot seleccionada de 4.441.260.032 tokens dentro de la etapa.

Su relevancia es acotada y de caracter metodologico: sirve como referencia reproducible para quien quiera auditar el pipeline de entrenamiento WALDO, comparar el checkpoint inicial con el continuado (`waldo-1b-continued-reference`) o estudiar el comportamiento de un base model de 1B con tokenizer byte-BPE de 32K. No es un modelo oficial de OpenWALDO y no debe confundirse con una release firmada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de tipo base (detalles de capas y atencion no disponibles) |
| Parametros totales | Aproximadamente 1B (deducido del identificador `general-base-1b-a-tuned-01`; cifra exacta no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el snapshot se distribuye en pesos nativos PyTorch para inferencia |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors dentro de un snapshot gestionado nativo; no compatible con exportacion estandar a Transformers/GGUF |

## Arquitectura y entrenamiento

La model card describe el modelo como un "raw causal base model", es decir, un transformer causal entrenado desde cero sin ajuste de instrucciones. No se detallan el numero de capas, dimensiones ocultas, mecanismo de atencion ni innovaciones arquitectonicas concretas; la informacion disponible se limita a los metadatos del run. El tokenizer es un byte-BPE de 32K tokens, un detalle relevante porque el autor advierte que la exportacion estandar a Hugging Face o GGUF no esta soportada para este tokenizer entrenado, lo que condiciona todo el flujo de uso.

El entrenamiento se realizo sobre un flujo de datos determinista con una mezcla de corpus declarada que incluye material bajo CC-BY-SA-4.0, CDLA-Sharing-1.0 y ODC-BY-1.0. La etapa reportada alcanzo 295.716 pasos y un objetivo de 4.845.010.944 tokens, con el checkpoint seleccionado en la posicion 4.441.260.032 tokens. El checkpoint continuado asociado parte de estos pesos seleccionados, reinicia el optimizador AdamW y baja el LR maximo de 4e-4 a 1e-4, reproduciendo el mismo flujo de datos determinista; el autor aclara que no se trata de datos nuevos unicos. No se menciona RLHF, DPO ni ninguna fase de alineacion posterior.

## Capacidades

- Generacion de texto autoregresiva basica en ingles como modelo causal sin ajuste.
- Razonamiento y conocimiento factual limitados: el autor reconoce errores factuales y deriva de tema.
- No dispone de modo de pensamiento, vision, audio ni capacidades multimodales.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilingue: solo ingles declarado.
- Uso previsto como referencia de reproducibilidad de experimentos, no como asistente.

## Casos de uso

- Reproduccion de experimentos de entrenamiento: cargar el snapshot con la CLI de WALDO y el entorno PyTorch compatible para verificar la perdida de validacion reportada (2,195388929 en FP32) y los bits por byte (0,799569705) sobre el conjunto reservado.
- Auditoria de pipelines de datos: inspeccionar los BOM nativos, `PACKAGE.json` y `ATTRIBUTION.md` para reconstruir la mezcla de corpus y las declaraciones de licencia de los datos de entrenamiento.
- Investigacion sobre tokenizers byte-BPE de 32K: estudiar el comportamiento de un tokenizer no exportable a formatos estandar y las implicaciones para la portabilidad de modelos.
- Comparacion de checkpoints: contrastar este checkpoint inicial con `waldo-1b-continued-reference` para medir el efecto del reinicio de AdamW y la reduccion del LR maximo sobre la misma secuencia de datos.
- Docencia y formacion en ingenieria de ML: usar un base model pequeno y reproducible para ilustrar el comportamiento de un modelo sin alineacion, incluidas sus derivas y errores.
- Pruebas de humo de infraestructura: el snapshot se ha probado con CUDA oculto, por lo que sirve para validar entornos de inferencia en CPU y flujos de la CLI de WALDO sin dependencia de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos de evaluacion son la perdida de validacion en inferencia FP32 (2,195388929) y los bits por byte (0,799569705) sobre el conjunto reservado, que no son comparables directamente con MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del artefacto (4,1 GB en pesos nativos) se puede estimar un rango orientativo de 4 a 8 GB en funcion de la precision efectiva y del overhead del runtime, pero es una estimacion, no un dato del autor.
- GPU recomendadas: no disponibles en la documentacion; el autor solo menciona el uso con `CUDA_VISIBLE_DEVICES=0` en la CLI de WALDO y una prueba de humo con CUDA oculto.
- Cabe en GPU de consumo: probablemente si, dado el tamano de 1B, pero no hay confirmacion oficial ni lista de modelos soportados.
- Opciones de despliegue: exclusivamente la CLI de WALDO con soporte nativo de modelo y tokenizer PyTorch; no hay soporte de vLLM, llama.cpp, Ollama ni TGI, y la exportacion a GGUF esta explicitamente no soportada para el tokenizer de 32K.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos de la misma categoria, y las diferencias de formato (snapshot nativo no exportable) dificultan una comparacion directa con base models de 1B en formatos estandar.

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones: no sigue instrucciones de forma fiable y no debe usarse como asistente conversacional.
- La cualificacion conductual congelada no se supero, segun el propio autor.
- Deriva de personaje y de tema documentada, ademas de errores factuales persistentes.
- Riesgo de alucinacion elevado por su condicion de base model sin alineacion.
- Solo ingles declarado; no hay soporte multilingue verificado.
- Longitud de contexto no documentada, lo que impide planificar cargas de contexto largo.
- Exportacion estandar a Transformers y GGUF no soportada; `AutoModel.from_pretrained` no debe asumirse funcional.
- El snapshot es de solo inferencia y no incluye todos los checkpoints historicos ni los payloads de optimizador, enumerados en `PACKAGE.json`.
- Licencia Apache 2.0 en los pesos, pero las declaraciones de datos de entrenamiento incluyen CC-BY-SA-4.0, CDLA-Sharing-1.0 y ODC-BY-1.0, que deben revisarse en `LICENSING.md` antes de cualquier uso comercial.
- No es una release oficial de OpenWALDO ni una release firmada; no constituye una divulgacion regulatoria completa.
- Los registros nativos conservan rutas historicas de host y runtime por motivos de reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/whiskeywhiskey/waldo-1b-initial-reference
- Checkpoint continuado: https://huggingface.co/whiskeywhiskey/waldo-1b-continued-reference
