# yava-code/Tessera-135M-Gate

## Resumen

Tessera-135M-Gate es un checkpoint de investigacion desarrollado por yava-code (Paragon Intelligence Labs) que sirve como "puerta de arquitectura" de la familia Tessera. Se construye sobre el backbone de HuggingFaceTB/SmolLM2-135M y anade la ruta completa de Next Concept Prediction (NCP), un mecanismo que predice un concepto continuo antes de decodificar el token. Con 142.113.600 parametros reales, no es un modelo de calidad linguistica: esta deliberadamente sobreajustado sobre un subconjunto de TinyStories de 1 millon de tokens repetido 16 veces (16.777.216 tokens vistos).

Su relevancia es metodologica, no de producto. El checkpoint demuestra que los tres objetivos de entrenamiento (NTP, NCP y VQ) convergen de extremo a extremo antes de invertir en una corrida mayor, y registra un fallo instructivo: a esta escala el codebook apenas se usa (perplejidad efectiva 2,4087 con uso del 33%), de modo que el decodificador puede ignorar el canal de conceptos. Publicarlo forma parte de una historia de escalado que culmina en la comparacion emparejada de 1.000 millones de tokens.

Por tanto, debe tratarse como un artefacto de reproducibilidad y estudio de arquitectura. No esta pensado para generacion de texto en produccion ni para evaluaciones de capacidad general, y requiere `trust_remote_code=True` por su implementacion de ConceptLM personalizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConceptLM causal sobre backbone SmolLM2-135M (chunk size 4, product code 9x64, 2 bloques de concepto causales) |
| Parametros totales | 142.113.600 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo pesos safetensors en el repositorio) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | HuggingFaceTB/SmolLM2-135M |
| Tamano del repositorio | 0,6 GB |
| Codigo personalizado | Si (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura es una implementacion compacta de estilo ConceptLM, no una replica del NCP-ArchPreview de 8.900 millones. Sobre el backbone SmolLM2-135M se anade una ruta de concepto causal con dos bloques de concepto, un product code de 9 segmentos por 64 entradas y un tamano de chunk de 4. La inyeccion del concepto se realiza antes del bloque 2 del decodificador de tokens, y el objetivo NCP predice el siguiente concepto continuo. La funcion de perdida combina los tres terminos con pesos unitarios: `L_ntp + 1 L_ncp + 1 L_vq`.

El entrenamiento uso un subconjunto de TinyStories de 1 millon de tokens repetido 16 veces, con un coste de computo estimado de 1,38 dolares. Se omite deliberadamente el codificado residual iterativo, las conexiones residuales entre escalas y la receta de entrenamiento a gran escala. El autor indica que los tres objetivos descendieron entre un 41% y un 43% durante la corrida, y que la intervencion de poner a cero la realimentacion de concepto eleva la perdida NTP de validacion en +0,0205 nats, lo que confirma que el decodificador usa causalmente el canal de conceptos aunque sea de forma debil.

## Capacidades

- Generacion de texto causal basica, heredada del backbone SmolLM2-135M, pero no evaluada como capacidad de calidad.
- Prediccion de siguiente concepto (NCP) como canal latente adicional al canal de tokens.
- Cuantizacion vectorial (VQ) mediante product code de 9 segmentos por 64 entradas.
- Realimentacion de concepto inyectada en la ruta del decodificador antes del bloque 2.
- Soporte de tool calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se documentan idiomas).
- Capacidades especiales: canal de concepto causal, pensado como objeto de estudio, no como modo "thinking" de producto.

## Casos de uso

- Estudio de escalado de arquitecturas híbridas: sirve como punto de partida de la familia Tessera para observar que comportamientos solo aparecen por encima de cierto umbral de tokens (el uso del codebook pasa de ~33% a 85,6% en el modelo de 1.000 millones de tokens).
- Reproducibilidad de investigacion: el repositorio incluye `eval.json` y `metrics.jsonl`, ademas de hashes SHA256 del corpus, lo que permite repetir la corrida y verificar la curva de perdida.
- Ablaciones de intervencion causal: poner a cero o barajar la realimentacion de concepto permite medir la dependencia del decodificador respecto al canal NCP con deltas de perdida de validacion.
- Prueba de pipeline de codigo personalizado: util para validar la carga con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` y la serializacion de modulos no estandar.
- Material docente sobre entrenamiento multiobjetivo: ilustra como una arquitectura puede explotar un atajo (feedback barajado con coste +0,000) cuando el corpus es demasiado pequeno y repetitivo.
- Linea base negativa en comparaciones de NCP: al estar sobreajustado, marca el suelo de calidad frente a los checkpoints de 1.000 millones de tokens antes de cualquier evaluacion seria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo publica metricas internas de la corrida de puerta:

| Metrica | Valor |
|---|---:|
| Perdida NTP en validacion | 1,8751 |
| Perplejidad en validacion | 6,5213 |
| Delta de realimentacion a cero | 0,0205 |
| Delta de realimentacion barajada | 0,0000 |
| Perplejidad del codebook / uso | 2,4087 / 33,0% |
| Tokens de entrenamiento | 16.777.216 |
| Coste de computo estimado | 1,38 USD |

Los deltas de intervencion son incrementos de perdida NTP en validacion respecto a la realimentacion normal de concepto, medidos sobre los mismos lotes. Segun el autor, en el modelo de 1.000 millones de tokens homólogo la perplejidad del codebook sube a 7,55, el uso al 85,6% y el delta a cero alcanza +0,105.

## Requisitos de hardware

- VRAM estimada: en fp16 los pesos ocupan aproximadamente 284 MB, por lo que la inferencia cabe holgadamente por debajo de 1 GB incluyendo activaciones y cache.
- Cuantizacion: en int8 los pesos bajan a unos 142 MB y en int4 a unos 71 MB, aunque no se distribuyen pesos cuantizados en el repositorio.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4090 o incluso una iGPU con memoria compartida pueden ejecutarlo.
- Cabe en GPU consumer: si, sin restricciones practicas por tamano.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via soportada. vLLM, TGI, llama.cpp u Ollama no estan documentados para esta arquitectura personalizada; su uso requeriria adaptaciones y no hay pesos GGUF publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tessera-135M-Gate | 142.113.600 | No disponible | Perplejidad validacion 6,5213 (TinyStories sobreajustado) | apache-2.0 | HuggingFace |
| SmolLM2-135M (base) | ~135 M | No disponible en la ficha | No comparable en esta informacion | apache-2.0 | HuggingFace |
| Tessera-1B-Nano-Base | No disponible (entrenado con 1.000 M de tokens) | No disponible | Control NTP-only; sin datos de perplejidad en esta informacion | apache-2.0 | HuggingFace |
| Tessera-1B-Nano | No disponible (entrenado con 1.000 M de tokens) | No disponible | Perplejidad codebook 7,55, uso 85,6%, delta a cero +0,105 | apache-2.0 | HuggingFace |

La comparacion directa con modelos de calidad general no es significativa, ya que Tessera-135M-Gate esta sobreajustado sobre un corpus sintetico y solo persigue validar la viabilidad arquitectonica.

## Limitaciones y advertencias

- No es un modelo de calidad linguistica: el autor lo declara explicitamente como checkpoint de puerta sobreajustado, no como resultado de rendimiento.
- Sobreajuste severo: 16.777.216 tokens vistos equivalen a un subconjunto de TinyStories de 1 millon de tokens repetido 16 veces, lo que invalida cualquier uso generativo general.
- Atajo aprendido: a esta escala la realimentacion barajada no penaliza (+0,000) y el uso del codebook es bajo (33%), senal de que el decodificador puede ignorar el canal de concepto.
- Riesgo de alucinacion: alto y no evaluado; no hay datos de fidelidad ni de comportamiento fuera de dominio.
- Idiomas: no disponibles; no se documenta ningun idioma soportado.
- Contexto: no documentado.
- Licencia: apache-2.0 permite uso comercial, pero el modelo no es apto para produccion por su naturaleza experimental.
- Dependencia de codigo personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor y anade riesgo operativo.
- Ausencia de benchmarks estandar: no hay MMLU, HumanEval ni GSM8K, por lo que no se puede situar frente a alternativas de proposito general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yava-code/Tessera-135M-Gate
- Coleccion Tessera: https://huggingface.co/collections/yava-code/tessera-next-concept-prediction-gated-and-scaled
- Tessera-1B-Nano-Base: https://huggingface.co/yava-code/Tessera-1B-Nano-Base
- Tessera-1B-Nano: https://huggingface.co/yava-code/Tessera-1B-Nano
- Repositorio del estudio: https://github.com/yava-code/Tessera-1B-Nano
- Paper ConceptLM: https://arxiv.org/abs/2602.08984
- Paper NCP-ArchPreview: https://arxiv.org/abs/2609.10715
- Modelo base SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
