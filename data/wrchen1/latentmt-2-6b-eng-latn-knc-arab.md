# wrchen1/LatentMT-2.6B-eng-latn-knc-arab

## Resumen

LatentMT-2.6B-eng-latn-knc-arab es un adaptador LoRA para traducción automática del par inglés (eng_Latn) a kanuri en escritura árabe (knc_Arab), desarrollado por Wei-Rui Chen y colaboradores en el marco del artículo "LatentMT: Machine Translation with Latent Reasoning" (arXiv:2607.18618). El adaptador se monta sobre el modelo base ByteDance/Ouro-2.6B-Thinking, un transformer causal de 2.6 mil millones de parámetros publicado bajo licencia Apache 2.0.

La propuesta principal de LatentMT es el razonamiento latente: en lugar de generar una cadena de pensamiento explícita en forma de tokens, el modelo realiza pasos recurrentes adicionales dentro de los estados ocultos (profundidad recurrente 4). Esto permite mejorar la calidad de la traducción sin aumentar el número de tokens generados, lo que resulta especialmente útil para lenguas de bajos recursos como el kanuri. Según el resumen del artículo, el sistema alcanza un rendimiento comparable a modelos de 3 a 5 veces más grandes en 32 direcciones de traducción, con un entrenamiento ligero.

Este repositorio contiene únicamente los pesos del adaptador (0.1 GB) y los metadatos necesarios para su carga con la librería PEFT. No se incluyen el modelo base ni el tokenizador, que deben descargarse por separado desde el repositorio de ByteDance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer causal (ByteDance/Ouro-2.6B-Thinking) con razonamiento latente recurrente |
| Parametros totales | 2.6B (modelo base) + adaptador LoRA (tamano exacto no disponible) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificados (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion estandar de transformers) |
| Idiomas soportados | Ingles (eng_Latn) y kanuri en escritura arabe (knc_Arab) |
| Licencia | Apache 2.0 (tanto el adaptador como el modelo base) |
| Formato de pesos | safetensors (adaptador) |

## Arquitectura y entrenamiento

El adaptador se implementa sobre ByteDance/Ouro-2.6B-Thinking, un modelo de lenguaje de 2.6B parametros con arquitectura transformer causal. La innovacion principal de LatentMT es el uso de "unrolling temporal" (total_ut_steps = 4): durante la generacion, el modelo ejecuta pasos recurrentes adicionales en el espacio latente de los estados ocultos, sin emitir tokens intermedios visibles. Esto permite dedicar mas capacidad de computo al razonamiento interno sin alargar la secuencia de salida.

El entrenamiento se describe como "ligero" (lightweight training) en el articulo, aunque no se detallan en la informacion disponible ni el tamano del corpus ni la composicion del dataset. El adaptador se entrena especificamente para el par eng_Latn-knc_Arab, y el articulo reporta resultados en 32 direcciones de traduccion que cubren lenguas de alta, media y baja disponibilidad de recursos. No se menciona el uso de RLHF ni DPO; el enfoque es de fine-tuning supervisado clasico con LoRA.

## Capacidades

- Traduccion automatica del ingles al kanuri (escritura arabe), un par de lenguas de bajos recursos.
- Razonamiento latente: realiza pasos recurrentes internos que mejoran la calidad de la traduccion sin generar tokens de cadena de pensamiento visibles.
- Generacion de texto condicionada a un prompt de traduccion (pipeline text-generation).
- Compatible con el ecosistema Hugging Face Transformers y PEFT, lo que permite integracion sencilla en pipelines existentes.
- No se ha documentado soporte para tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Traduccion de documentos oficiales y tecnicos del ingles al kanuri: el modelo puede procesar textos largos y producir traducciones coherentes en un idioma con escasos recursos digitales, gracias a su razonamiento latente que compensa la falta de datos de entrenamiento.
- Localizacion de software y contenido web para comunidades de habla kanuri: al ser un adaptador ligero, puede desplegarse en infraestructura modesta y usarse para traducir interfaces, avisos o contenido generado por usuarios.
- Investigacion en traduccion automatica de lenguas de bajos recursos: el checkpoint sirve como punto de partida para estudios sobre razonamiento latente, transferencia entre pares de lenguas o metodos de adaptacion eficiente.
- Generacion de datos sinteticos paralelos: el modelo puede usarse para crear pares ingles-kanuri que alimenten otros sistemas de traduccion o modelos de lenguaje multilingues.
- Evaluacion comparativa de metodos de traduccion con razonamiento interno: al estar publicado con codigo de carga reproducible, permite comparar directamente la estrategia de LatentMT frente a enfoques con cadena de pensamiento explicita.
- Prototipado rapido en entornos academicos: el adaptador se carga con pocas lineas de codigo y no requiere entrenamiento adicional, lo que facilita su uso en talleres, cursos o pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo arXiv menciona que LatentMT alcanza un rendimiento comparable a modelos de 3 a 5 veces mas grandes en 32 direcciones de traduccion, pero no se proporcionan cifras concretas (puntuaciones BLEU, COMET, etc.) en la model card ni en los resultados de busqueda. Se recomienda consultar el articulo completo para obtener datos numericos detallados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 2.6B en precision FP16 requiere aproximadamente 5.2 GB de VRAM solo para los pesos, mas overhead de activaciones y cache. Con cuantizacion de 8 bits puede reducirse a unos 3 GB, y con 4 bits a unos 2 GB. El adaptador LoRA anade un coste minimo (menos de 0.1 GB).
- GPU recomendadas: tarjetas consumer con 8 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4070, etc.) son suficientes para inferencia con cuantizacion. Para FP16 completo se recomienda al menos 8 GB, aunque 12 GB o mas ofrecen margen comodo.
- Si cabe en consumer GPU: si, en la mayoria de GPUs modernas con 8 GB o mas, especialmente usando cuantizacion (bitsandbytes).
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). Tambien es compatible con Ollama si se empaqueta adecuadamente. El adaptador requiere PEFT para cargarse sobre el modelo base.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de 2.6B con pasos recurrentes internos, la latencia sera algo mayor que la de un modelo denso equivalente sin recurrencia, pero no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa directa con modelos alternativos del mismo par de idiomas o de tamano similar. El articulo menciona que LatentMT supera o iguala a modelos de 3 a 5 veces mas grandes, pero no se listan los nombres de esos modelos en la informacion disponible. Se recomienda consultar el articulo para obtener la comparativa completa.

## Limitaciones y advertencias

- El adaptador solo cubre un unico par de idiomas (ingles a kanuri en escritura arabe). No es un modelo multilingue general.
- Depende completamente del modelo base ByteDance/Ouro-2.6B-Thinking; si este cambia o deja de estar disponible, el adaptador no funcionara.
- El razonamiento latente con profundidad 4 puede aumentar el coste computacional por token generado, aunque no se han publicado mediciones de latencia.
- Al ser un modelo entrenado para traduccion, puede producir alucinaciones o traducciones inexactas en textos ambiguos o muy especializados, especialmente en un idioma de bajos recursos como el kanuri.
- No se han documentado sesgos especificos, pero el modelo base puede arrastrar sesgos presentes en sus datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base (tambien Apache 2.0 segun la informacion) y las condiciones de uso del articulo.
- El README indica que el uso previsto es "para investigacion en traduccion automatica", por lo que su despliegue en produccion sin validacion adicional no esta garantizado.

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/wrchen1/LatentMT-2.6B-eng-latn-knc-arab
- Articulo en arXiv: https://arxiv.org/abs/2607.18618
- PDF del articulo: https://arxiv.org/pdf/2607.18618
- Modelo base ByteDance/Ouro-2.6B-Thinking: https://huggingface.co/ByteDance/Ouro-2.6B-Thinking
