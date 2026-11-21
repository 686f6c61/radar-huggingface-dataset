# trymirai/Qwen3.5-9B-L

## Resumen

Mirai Qwen3.5-9B Large es una cuantizacion de 8 bits del modelo Qwen3.5-9B de Alibaba, publicada por trymirai (Mirai Labs) bajo licencia Apache 2.0. El checkpoint incorpora, ademas de los pesos cuantizados del modelo base, un especulador de decodificacion (un draft model DFlash de seis capas, un modelo Weaver de una capa para construccion de arbol y una cabeza de confianza aprendida) que acelera la inferencia sobre silicio de Apple. El objetivo es desplazar la frontera velocidad-calidad de los LLM locales en macOS sin degradar de forma apreciable la distribucion del modelo original: el autor reporta una divergencia KL de 0,0007345 y un 98,96 % de acuerdo top-1 frente al profesor.

El modelo conserva los 9.095.911.424 parametros del Qwen3.5-9B original; la cuantizacion es simetrica de 8 bits con escalas en bfloat16 y tamano de grupo 64, complementada con transformadas de Hadamard aleatorias bloque-diagonales (bloque de 32) para reducir valores atipicos en activaciones y pesos. El repositorio ocupa 49,7 GB e incluye pesos en safetensors, el especulador en formato MLX de 2 bits y artefactos auxiliares.

La relevancia actual del checkpoint es doble: por un lado, demuestra que la cuantizacion de 8 bits con transformadas de Hadamard puede mantener una calidad casi identica al modelo en bf16; por otro, introduce decodificacion especulativa empaquetada con el modelo, algo poco habitual en publicaciones de cuantizacion. La contrapartida es una dependencia fuerte del ecosistema propietario de Mirai: la libreria `uzu` y la CLI `mirai`, con soporte exclusivo para Apple silicon en el momento de la publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-9B; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 9.095.911.424 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits simetrica entera con escalas bfloat16 y group size 64; especulador en 2 bits MLX con group size 128 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo principal); MLX cuantizado para el especulador |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion post-entrenamiento del Qwen3.5-9B. La receta de Mirai Large aplica cuantizacion simetrica de 8 bits con escalas en bfloat16 y tamano de grupo 64, e inserta transformadas de Hadamard aleatorias con estructura bloque-diagonal (bloque de 32) para aplanar los valores atipicos tanto en activaciones como en pesos antes de cuantizar. Segun la model card, los pesos del modelo base no se modifican en esta release; lo que se actualiza respecto a versiones anteriores es el especulador y la cabeza de confianza.

El componente diferencial es el subsistema de decodificacion especulativa, ubicado en el directorio `speculator/`: un draft model DFlash de seis capas, un modelo Weaver de una capa que construye el arbol de candidatos y una cabeza de confianza aprendida que decide cuando aceptar tokens propuestos. Las proyecciones de DFlash y Weaver usan cuantizacion MLX de 2 bits con group size 128 y transformadas de Hadamard de 32 en entrada y salida. Las variantes Large y Medium comparten los mismos pesos de especulador y cabeza de confianza. No se dispone de informacion sobre el volumen de tokens de entrenamiento del modelo base, la composicion del dataset ni si hubo RLHF o DPO; esos datos corresponden a la model card de Qwen/Qwen3.5-9B, no incluida en la informacion proporcionada.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Qwen3.5-9B.
- Decodificacion especulativa con draft model DFlash, modelo Weaver y cabeza de confianza aprendida, orientada a reducir la latencia por token.
- Cuantizacion de 8 bits con calidad practicamente indistinguible del profesor segun la metrica del autor (KL 0,0007345; acuerdo top-1 del 98,96 % sobre 14.399 tokens de continuacion generados por el profesor en 20 conversaciones).
- Inferencia local en Apple silicon mediante la CLI `mirai` y la libreria `uzu`.
- Capacidades de razonamiento, codigo, matematicas, tool calling, agentes o vision: no disponibles en la informacion proporcionada (dependen del modelo base y no se detallan en esta model card).
- Soporte multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac para desarrollo y prototipado: el checkpoint esta disenado para ejecutarse en Apple silicon con la CLI `mirai`, lo que permite disponer de un modelo de 9B en 8 bits en un portatil o Mac Studio sin GPU dedicada.
- Asistentes de codigo en el editor sobre macOS: la decodificacion especulativa reduce la latencia por token, algo critico en autocompletado interactivo donde el tiempo hasta el primer token y el throughput sostenido condicionan la experiencia.
- Procesamiento por lotes de texto en local: al mantener la distribucion del modelo original con una KL muy baja, es adecuado para tareas de resumen, extraccion y reescritura que no toleran derivas notables respecto al modelo de referencia.
- Evaluacion comparativa de tecnicas de cuantizacion: el checkpoint publica metricas KL y acuerdo top-1 medibles con `romakl`, lo que lo convierte en un punto de referencia util para investigar el impacto de la cuantizacion de 8 bits con transformadas de Hadamard.
- Investigacion en decodificacion especulativa: el especulador DFlash + Weaver + cabeza de confianza es un caso de estudio concreto de tree-based speculative decoding empaquetado con el modelo, replicable en otros checkpoints.
- Despliegue de un asistente conversacional privado en estaciones de trabajo Mac: al ejecutarse integramente en local, evita el envio de datos a servicios externos, lo que encaja en entornos con requisitos de confidencialidad.
- Generacion de contenido asistida en flujos de trabajo de escritorio: integrable mediante la CLI o la libreria `uzu` en scripts y automatizaciones de macOS.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas de fidelidad de la cuantizacion frente al profesor, evaluadas con `romakl` sobre su conjunto por defecto (20 conversaciones, 14.399 tokens de continuacion generados por el profesor):

| Metrica | Valor |
|---|---|
| Divergencia KL frente al profesor | 0,0007345 |
| Acuerdo top-1 | 98,96 % |
| Conjunto de evaluacion | 20 conversaciones, 14.399 tokens |
| Herramienta | romakl (commit bfb79f5) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card remite a la del modelo original Qwen/Qwen3.5-9B para evaluaciones, pero esos datos no se incluyen aqui.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: el repositorio ocupa 49,7 GB, pero ese tamano incluye pesos auxiliares (especulador, vision y MTP). El peso generador de tokens en 8 bits para 9.095.911.424 parametros ronda los 9,1 GB en el mejor caso teorico, aunque el tamano real en disco y en memoria debe consultarse en la pagina del modelo; no se proporciona una cifra oficial de memoria de inferencia.
- Plataforma soportada: exclusivamente Apple silicon (macOS) en el momento de la publicacion, segun la model card.
- GPU recomendadas: no disponibles. El modelo no esta pensado para CUDA; no se documenta soporte para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, en el ecosistema Apple (Mac con memoria unificada suficiente), aunque no se especifica el minimo exacto de memoria unificada requerido.
- Opciones de despliegue: CLI `mirai` (instalable via Homebrew: `brew install mirai`) y la libreria `uzu`; compilacion desde el repositorio de GitHub de `uzu`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles como cifras absolutas; la model card solo afirma que la decodificacion especulativa mejora la frontera velocidad-calidad, sin publicar tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / plataforma | Notas |
|---|---|---|---|---|---|
| trymirai/Qwen3.5-9B-L (este) | 9,10 B | no disponible | Apache 2.0 | safetensors + MLX, solo Apple silicon | Cuantizacion 8 bits con especulador incluido; KL 0,0007345 |
| Qwen/Qwen3.5-9B (base) | 9,10 B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar; referencia de calidad |
| Otras cuantizaciones de Qwen3.5-9B (GGUF, MLX) | 9,10 B | no disponible | Apache 2.0 (heredada) | GGUF, MLX | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion sobre alternativas comparables con metricas publicadas en el mismo conjunto de evaluacion; la comparativa se limita al modelo base y a formatos de cuantizacion genericos.

## Limitaciones y advertencias

- Dependencia de plataforma: solo se soporta inferencia en Apple silicon; no hay soporte documentado para CUDA, ROCm ni CPU generica.
- Dependencia de tooling propietario: requiere la CLI `mirai` o la libreria `uzu`, lo que limita la portabilidad y la integracion en pipelines existentes basados en vLLM, TGI o llama.cpp.
- Idiomas soportados no documentados: la model card no especifica la cobertura linguistica, que hereda del modelo base pero no se detalla.
- Longitud de contexto no documentada: no se indica la ventana de contexto efectiva de esta cuantizacion.
- Riesgo de alucinacion: inherente al modelo base; no se han publicado evaluaciones de factualidad especificas para este checkpoint.
- Sesgos: no se documentan sesgos conocidos en la informacion proporcionada; deben asumirse los del modelo Qwen3.5-9B original.
- Licencia: Apache 2.0 permite uso comercial, pero la licencia enlazada apunta al fichero LICENSE del modelo base; conviene verificar los terminos del modelo original antes de un despliegue comercial.
- El checkpoint actualiza el especulador y la cabeza de confianza respecto a releases anteriores, pero mantiene los pesos del modelo base; no debe confundirse con un fine-tuning.
- El tamano del repositorio (49,7 GB) incluye pesos auxiliares no necesarios para la generacion de texto, lo que puede complicar la gestion de almacenamiento y la descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trymirai/Qwen3.5-9B-L
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Model card del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/README.md
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Pagina del producto: https://trymirai.com/local-models/alibaba-qwen3-5-9b-mirai-mirai-l-8
- Blog de cuantizacion: https://trymirai.com/blog/quantization
- Repositorio de uzu: https://github.com/trymirai/uzu
- Herramienta romakl: https://github.com/trymirai/romakl/tree/bfb79f548a80b6af7d9f4d4e35d0db99b97708e8
