# ZTFlynn/LFM2.5-8B-A1B-Cascadia-ternary3

## Resumen

ZTFlynn/LFM2.5-8B-A1B-Cascadia-ternary3 es un paquete comprimido del modelo LFM2.5-8B-A1B de Liquid AI, desarrollado por ZTFlynn. Utiliza la técnica de compresión Cascadia, que combina una superficie spline con tablas de búsqueda por banda (lookup tables) y cuantización ternaria, logrando un tamaño de 5,49 GB frente a los 16,15 GB del checkpoint original en bf16, una reducción de 3,09 veces. El paquete está diseñado para ejecutarse en CPU mediante un runtime en C cuyas únicas dependencias son libc, libm y libgomp, lo que lo hace adecuado para entornos edge y sin GPU.

El modelo base LFM2.5-8B-A1B es un Mixture of Experts (MoE) de 8.000 millones de parámetros totales con 1.500 millones activos por token, contexto de 128.000 tokens y capacidades de razonamiento encadenado (chain of thought) y tool calling. La compresión mantiene la arquitectura y las capacidades del original, con una pérdida de calidad medida como no significativa en términos de perplexidad (53,50 vs 54,83, dentro del intervalo de confianza del 95%). Esta ficha cubre tanto el paquete comprimido como el modelo base subyacente, ya que la información disponible se centra en la compresión y sus efectos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con 24 bloques, GQA 32q/8kv, convoluciones cortas con puerta (gated short convolutions), 32 expertos top-4 sobre 2 capas densas |
| Parametros totales | 8.000 millones (modelo base) |
| Parametros activos | 1.500 millones (modelo base, 4 de 32 expertos) |
| Longitud de contexto | 128.000 tokens (modelo base) |
| Tipos de cuantizacion | Ternaria con spline y lookup tables por banda (0,60 bytes por peso, 5,18 bits por peso) |
| Idiomas soportados | Ingles (en) |
| Licencia | lfm-open-license (ver enlace en la model card) |
| Formato de pesos | Paquete Cascadia: weights.bin (5,49 GB), manifest.json, aux.bin, tokenizer.bin |

## Arquitectura y entrenamiento

El modelo base LFM2.5-8B-A1B es un MoE desarrollado por Liquid AI, con 24 capas, atención GQA (32 queries, 8 key-value), convoluciones cortas con puerta y 32 expertos de los que se activan 4 por token, sobre dos capas densas. Tiene un contexto de 128.000 tokens y está optimizado para ejecución en dispositivos. No se dispone de detalles sobre el dataset de entrenamiento ni sobre técnicas de alineación (RLHF/DPO) en la información proporcionada.

El paquete Cascadia aplica una compresión basada en una superficie B-spline ajustada a cada matriz de pesos para capturar la estructura a gran escala. Cada peso se asigna a una de 32 bandas según el valor de la spline, y se aprende un codebook k-means por banda sobre los residuos. El 0,5% de los errores más grandes se conservan exactamente en f32. Los índices de los codebooks se empaquetan en base 3, cinco trits por byte (3⁵ = 243). La reconstrucción se realiza como W = spline(j,c) + codebook[band][index], evaluada dentro de la multiplicación matriz-vector, sin construir nunca la matriz densa. El embedding atado (que también actúa como lm_head) usa 81 entradas de codebook en lugar de 27, lo que lo convierte en el tensor mejor reconstruido del modelo.

## Capacidades

- Generacion de texto: el modelo base es un modelo de lenguaje generativo de texto completo, y el paquete comprimido mantiene esta capacidad.
- Razonamiento encadenado (chain of thought): el modelo base soporta razonamiento paso a paso, según la documentacion de Liquid AI.
- Tool calling / function calling: el modelo base destaca en llamadas a herramientas y tareas agénticas, tal como se indica en la web de Liquid AI.
- Soporte de agentes: el modelo base está diseñado para tareas agénticas multi-paso.
- Contexto largo: ventana de 128.000 tokens, útil para documentos extensos y conversaciones multi-turno.
- Multilingüismo: solo inglés (en), según la etiqueta de idioma.

## Casos de uso

- Inferencia en CPU para entornos edge: el paquete ejecuta en CPU con solo libc, libm y libgomp, ideal para dispositivos sin GPU o servidores de bajo coste. Por ejemplo, un asistente local en un mini-PC o un router con suficiente RAM.
- Atencion al cliente automatizada: con 128K de contexto, el modelo puede gestionar conversaciones multi-turno largas, manteniendo el historial completo sin truncar, y usando tool calling para consultar bases de datos o sistemas de tickets.
- Generacion de codigo en produccion: el modelo base soporta tool calling y puede integrarse en pipelines de CI/CD para generar, revisar o completar código, ejecutándose en CPU sin depender de GPUs compartidas.
- Analisis de documentos extensos: la ventana de 128K permite procesar contratos, informes o artículos largos en una sola pasada, extrayendo resúmenes o respondiendo preguntas específicas.
- Agentes autónomos en dispositivos locales: al ser un MoE con solo 1,5B activos, el modelo puede ejecutarse en un portátil o en un teléfono de gama alta, permitiendo agentes que planifican y ejecutan tareas sin conexión a la nube.
- Prototipado rapido de aplicaciones de lenguaje: el paquete comprimido, con su runtime ligero, facilita pruebas y desarrollo en entornos con recursos limitados, como contenedores Docker con restricciones de memoria.

## Benchmarks y rendimiento

La model card del paquete reporta mediciones de perplexidad sobre 8.176 tokens pareados de FineWeb-Edu en 15 ventanas independientes de 512 tokens, comparando el modelo base en bf16 con el paquete comprimido. También proporciona métricas de fidelidad de reconstrucción.

| Metrica | Modelo base (bf16) | Paquete Cascadia | Diferencia |
|---|---|---|---|
| Perplexidad | 53,50 | 54,83 | No significativa (95% CI [0,9818x, 1,0568x], t = +0,98) |
| Error L2 relativo | — | 0,0548 | — |
| Ganancia sistematica | — | 0,9994 | — |

Desglose del error L2 por clase de tensor:

| Clase | Error L2 relativo | Proporcion del modelo |
|---|---|---|
| Expertos | 0,0570 | 7.751M parametros |
| Lineales | 0,0618 | 454M parametros |
| Embedding | 0,0224 | 262M parametros |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El paquete esta disenado para CPU: el runtime C requiere unicamente libc, libm y libgomp (OpenMP). No necesita GPU.
- Tamano del paquete: 5,49 GB de pesos, por lo que se necesita al menos 6-8 GB de RAM libre para cargar el modelo y ejecutar inferencia, dependiendo del sistema.
- GPU recomendadas: ninguna, aunque si se desea usar el modelo base sin comprimir, se necesitaria una GPU con al menos 16 GB de VRAM para bf16 (16,15 GB). El paquete comprimido evita ese requisito.
- Opciones de despliegue: runtime Cascadia (repositorio cassie en GitHub) para ejecucion en C, o la interfaz Python con `load_compressed` que carga el paquete sobre el modelo base en transformers.
- Latencia y throughput: no se proporcionan cifras concretas. Al ser un MoE con 1,5B activos, se espera una velocidad razonable en CPU moderna, pero depende del hardware y del numero de hilos.

## Comparativa con modelos similares

La comparacion directa se establece con el modelo base sin comprimir, ya que no se dispone de datos de otros modelos cuantizados comparables en la informacion proporcionada.

| Modelo | Parametros totales | Activos | Contexto | Tamano | Licencia | Formato |
|---|---|---|---|---|---|---|
| LFM2.5-8B-A1B (bf16) | 8B | 1,5B | 128K | 16,15 GB | lfm-open-license | Checkpoint transformers |
| LFM2.5-8B-A1B-Cascadia-ternary3 | 8B | 1,5B | 128K | 5,49 GB | lfm-open-license | Paquete Cascadia |

No se dispone de informacion sobre otros modelos comparables en la misma categoria de tamano y compresion.

## Limitaciones y advertencias

- El paquete es una compresion con perdida: aunque la perplexidad no muestra una degradacion significativa en la medicion reportada, el error L2 relativo es de 0,0548, lo que implica que los pesos reconstruidos no son identicos a los originales. Esto podria afectar a tareas muy sensibles a pequenas variaciones.
- La medicion de calidad se limita a perplexidad sobre FineWeb-Edu; no se han evaluado otros benchmarks como MMLU o HumanEval, por lo que el rendimiento en tareas especificas no esta garantizado.
- El modelo solo soporta ingles, lo que limita su uso en aplicaciones multilingues.
- La licencia lfm-open-license puede tener restricciones de uso comercial; es necesario revisar el texto completo de la licencia en el enlace proporcionado.
- El paquete no es un checkpoint de transformers estandar; requiere el runtime Cascadia o la interfaz Python especifica. No es compatible con herramientas habituales como llama.cpp, vLLM u Ollama sin adaptacion.
- La model card indica una seccion "Limitation" pero no incluye texto adicional; se recomienda consultar la documentacion del modelo base para conocer limitaciones adicionales.
- El ejemplo de salida en la model card esta vacio, por lo que no se puede verificar la calidad de generacion real del paquete comprimido.

## Enlaces

- [HuggingFace del paquete comprimido](https://huggingface.co/ZTFlynn/LFM2.5-8B-A1B-Cascadia-ternary3)
- [HuggingFace del modelo base](https://huggingface.co/LiquidAI/LFM2.5-8B-A1B)
- [Blog de Liquid AI sobre LFM2.5-8B-A1B](https://www.liquid.ai/blog/lfm2-5-8b-a1b)
- [Documentacion de Liquid AI para LFM2.5-8B-A1B](https://docs.liquid.ai/lfm/models/lfm25-8b-a1b)
- [Repositorio del runtime Cascadia (cassie)](https://github.com/EntroMorphic/cassie)
- [Formato de paquete de Cascadia](https://github.com/EntroMorphic/cassie/blob/main/docs/package_format.md)
