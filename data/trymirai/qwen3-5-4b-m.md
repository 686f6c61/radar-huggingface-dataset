# trymirai/Qwen3.5-4B-M

## Resumen

Mirai's Qwen3.5-4B Medium Quantization (identificador `trymirai/Qwen3.5-4B-M`) es una version cuantizada a 4 bits del modelo Qwen3.5-4B de Alibaba, desarrollada por Mirai Labs y distribuida bajo licencia Apache 2.0. Su objetivo es reducir el coste de inferencia y el tamano del checkpoint manteniendo una divergencia KL baja respecto al modelo original, con el foco explicito en inferencia local sobre silicio de Apple (macOS con chips M-series).

El checkpoint emplea cuantizacion entera asimetrica de 4 bits con zero points de 4 bits, escalas en bfloat16 y tamano de grupo 32, complementada con transformadas de Hadamard aleatorias block-diagonales para mitigar valores atipicos en activaciones y pesos. Sobre esa base, el autor aplica post-training quantization (PTQ) seguido de destilacion con conciencia de cuantizacion (QAD), lo que situa el modelo en la frontera de Pareto tamano-divergencia KL segun la evaluacion del propio autor.

El modelo declara 2.302.180.352 parametros en safetensors (nota: el nombre comercial indica 4B, pero el recuento real de parametros almacenados es de aproximadamente 2,3 mil millones, presumiblemente por la estructura del checkpoint cuantizado). El repositorio ocupa 13,4 GB y acumula 932 descargas y 2 likes en Hugging Face. La libreria de referencia es `uzu`, un runtime propio del ecosistema Mirai, y la model card indica que por ahora solo se soporta inferencia en Apple silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B; detalles de arquitectura no disponibles en esta ficha) |
| Parametros totales | 2.302.180.352 (segun safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit asimetrica con zero points de 4 bits, escalas bfloat16, group size 32; tags adicionales indican 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `uzu`; no se menciona GGUF) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, cuya arquitectura completa (tipo de transformer, atencion, contexto maximo, composicion del dataset de preentrenamiento, fases de RLHF/DPO) no se detalla en la informacion disponible y remite a la model card del modelo original. Lo que si se especifica es el proceso de cuantizacion: PTQ a 4 bits con escalas bfloat16 y grupos de 32, uso de Block-diagonal Random Hadamard Transforms (RHT) para reducir outliers en activaciones y pesos, y posterior destilacion quantization-aware para recuperar calidad. La evaluacion interna del autor se realizo sobre una mezcla de datos compuesta por 45% datos publicos agenticos, 30% datos publicos de SFT y contexto largo, y 25% datos privados de chat.

La innovacion tecnica destacable es el pipeline PTQ + QAD con RHT, que el autor presenta como frontera de Pareto en la relacion tamano-divergencia KL. No se documentan tecnicas de decodificacion especulativa, atencion lineal ni modos de razonamiento extendido en esta ficha; cualquier innovacion de ese tipo corresponderia al modelo base Qwen3.5-4B y no esta reflejada aqui.

## Capacidades

- Generacion de texto (pipeline declarado: `text-generation`).
- Razonamiento y conversacion multi-turno, heredados del modelo base Qwen3.5-4B (sin detalle especifico en la informacion disponible).
- Soporte de escenarios agenticos: la mezcla de evaluacion incluye un 45% de datos publicos agenticos, lo que sugiere uso en tareas de agente y multi-step reasoning.
- Contexto largo: la mezcla de evaluacion incluye datos de SFT y contexto largo (30%), indicando cobertura de prompts extensos, aunque la longitud exacta de contexto no esta disponible.
- Capacidades multilingues: no disponible (el campo de idiomas figura como no disponible).
- Tool calling / function calling: no disponible de forma explicita en la informacion proporcionada.
- Modos especiales (thinking, vision, audio): no disponible.

## Casos de uso

- Inferencia local en Mac: ejecutar el modelo directamente en un Mac con chip Apple silicon mediante el CLI `mirai --model trymirai/Qwen3.5-4B-M` instalado por Homebrew, ideal para desarrolladores que quieren un LLM de chat sin depender de la nube ni de GPUs dedicadas.
- Prototipado de agentes en estacion de trabajo: gracias a la mezcla de evaluacion con 45% de datos agenticos, el modelo es adecuado para probar flujos de agente y multi-step reasoning localmente antes de escalar a infraestructura.
- Asistentes de codigo offline: usar el modelo en un editor o CLI local para autocompletado, explicacion de codigo y refactorizacion, aprovechando la cuantizacion de 4 bits para reducir huella de memoria en portatiles.
- Resumen y analisis de documentos largos: la inclusion de datos de contexto largo en la mezcla de evaluacion sugiere utilidad para tareas de sintesis sobre entradas extensas, siempre que se verifique la ventana efectiva del modelo base.
- Chat de soporte en entornos con requisitos de privacidad: al ejecutarse en local y con licencia Apache 2.0, permite desplegar asistencia conversacional sin enviar datos a terceros.
- Experimentacion con tecnicas de cuantizacion: investigadores pueden usar este checkpoint como referencia para comparar PTQ + QAD con RHT frente a otras estrategias de cuantizacion 4-bit (GPTQ, AWQ) sobre el mismo modelo base.
- Evaluacion de runtimes alternativos: desarrolladores interesados en `uzu` pueden usar este modelo para medir latencia y throughput frente a llama.cpp, Ollama o MLX en Apple silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la divergencia KL frente al checkpoint de referencia, presentada como grafico (`kl-vs-size.svg`) y descrita cualitativamente como frontera de Pareto en tamano-divergencia KL, sin cifras numericas en el texto proporcionado.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: no disponible con cifras exactas; el repositorio ocupa 13,4 GB, pero el peso efectivo de inferencia a 4 bits sera inferior. Se recomienda verificar el consumo real con el runtime `uzu`.
- GPU recomendadas: el autor declara soporte exclusivo para Apple silicon (chips M-series); no se mencionan A100, H100 ni RTX 4090.
- Compatibilidad con GPU consumer: no disponible; no se indica soporte para CUDA.
- Opciones de despliegue: CLI `mirai` (Homebrew), libreria `uzu`, compilacion desde codigo fuente segun la guia del repositorio `trymirai/uzu`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma | Notas |
|---|---|---|---|---|---|---|
| trymirai/Qwen3.5-4B-M | 2.302.180.352 (safetensors) | no disponible | 4-bit PTQ + QAD, group 32 | Apache 2.0 | Apple silicon (`uzu`) | Frontera Pareto tamano-KL segun el autor |
| Qwen/Qwen3.5-4B | no disponible | no disponible | bfloat16 (original) | Apache 2.0 | Multiples (segun model card original) | Modelo base de referencia |
| Otras cuantizaciones 4-bit de Qwen3.5-4B (GPTQ, AWQ, GGUF) | no disponible | no disponible | 4-bit | Apache 2.0 | llama.cpp, vLLM, etc. | No se dispone de datos comparativos en esta ficha |

## Limitaciones y advertencias

- Plataforma limitada: la model card indica que solo se soporta inferencia en Apple silicon; no hay soporte declarado para CUDA, ROCm ni CPU generica.
- Dependencia del runtime `uzu`: el checkpoint esta empaquetado para la libreria `uzu`, lo que puede complicar la integracion con stacks estandar (transformers, vLLM, llama.cpp).
- Perdida de calidad por cuantizacion: aunque se aplica QAD para mitigar el dano, la cuantizacion 4-bit implica divergencia KL no nula respecto al modelo original; conviene validar tareas sensibles.
- Recuento de parametros inconsistente con el nombre: el nombre comercial indica 4B, pero safetensors reporta 2.302.180.352 parametros; verificar el checkpoint antes de dimensionar infraestructura.
- Idiomas no declarados: no se especifica cobertura multilingue, por lo que no se debe asumir soporte de castellano o otros idiomas sin pruebas.
- Contexto maximo no disponible: no se puede garantizar comportamiento optimo en prompts muy largos sin consultar la model card del modelo base.
- Riesgo de alucinacion: inherente a los LLM; no se documentan mitigaciones especificas en esta ficha.
- Sesgos: no se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3.5-4B conviene revisar la licencia del modelo base y las obligaciones de atribucion.
- Fecha de publicacion: el modelo figura creado en junio de 2026 y actualizado en noviembre de 2026; verificar que la informacion de la model card sigue vigente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trymirai/Qwen3.5-4B-M
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Model card del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/README.md
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Pagina del producto en Mirai: https://trymirai.com/local-models/alibaba-qwen3-5-4b-mirai-mirai-m-4
- Blog de cuantizacion de Mirai: https://trymirai.com/blog/quantization
- Guia de ejecucion de `uzu`: https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md
- Repositorio `uzu`: https://github.com/trymirai/uzu
