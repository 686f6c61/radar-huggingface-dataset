# zaddyzaddy/soro

## Resumen

zaddyzaddy/soro es un adaptador PEFT (LoRA) publicado en Hugging Face por el usuario zaddyzaddy, construido sobre el modelo base unsloth/llama-3-8b-bnb-4bit, una version cuantizada a 4 bits de Llama 3 de 8 mil millones de parametros. El repositorio contiene unicamente los pesos del adaptador en formato safetensors, no un modelo completo, por lo que su uso requiere cargar el modelo base y aplicar el adaptador mediante la libreria PEFT.

El modelo se presenta como un fine-tuning de tipo LoRA sobre Llama 3 8B, pero la model card esta practicamente vacia: todos los campos de descripcion, datos de entrenamiento, evaluacion, licencia e idiomas figuran como "[More Information Needed]". No hay informacion publica sobre el dataset utilizado, el procedimiento de entrenamiento ni los objetivos de la adaptacion, lo que limita seriamente cualquier evaluacion rigurosa.

Su relevancia actual es escasa: cuenta con 9 descargas y 0 likes, no tiene pipeline declarado y su utilidad practica no puede determinarse sin documentacion adicional. Esta ficha documenta lo que es verificable a partir de los metadatos del repositorio y advierte explicitamente de las lagunas de informacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3) con adaptador LoRA (PEFT) |
| Parametros totales | 4.650.177.629 (pesos del adaptador en safetensors; el modelo base Llama 3 8B tiene ~8.000 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Llama 3 8B: 8.192 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | base en 4 bits (bnb-4bit); el adaptador se distribuye en safetensors de 8 bits segun tags |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base unsloth/llama-3-8b-bnb-4bit |
| Libreria | peft 0.11.1 |
| Tamano del repositorio | 15,5 GB |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) sobre Llama 3 8B, la arquitectura transformer decoder-only de Meta con atencion causal estandar. El modelo base empleado es la version cuantizada a 4 bits de Unsloth (unsloth/llama-3-8b-bnb-4bit), lo que sugiere que el fine-tuning se realizo con las optimizaciones de Unsloth para entrenamiento con cuantizacion. El adaptador se carga a traves de la libreria PEFT.

No hay informacion disponible sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos, el uso de RLHF/DPO ni ninguna innovacion tecnica. La model card no documenta hiperparametros, regimen de entrenamiento ni procedimiento. El unico dato tecnico verificable es la version de PEFT utilizada (0.11.1) y la referencia generica al paper de Lacoste et al. (2019) sobre emisiones de carbono, que es una plantilla por defecto y no indica nada sobre el entrenamiento real.

## Capacidades

- Generacion de texto: hereda las capacidades del modelo base Llama 3 8B, si bien la adaptacion concreta no esta documentada.
- Razonamiento y codigo: presumiblemente las del modelo base, sin evidencia publicada del efecto del fine-tuning.
- Tool calling / function calling: no documentado; no se puede confirmar.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; los idiomas soportados figuran como no disponibles.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Experimentacion con adaptadores LoRA: el modelo puede servir para estudiar como se aplica un adaptador PEFT sobre un modelo base cuantizado a 4 bits, cargandolo con la libreria PEFT y el modelo base de Unsloth.
- Investigacion de fine-tuning con Unsloth: util para reproducir flujos de entrenamiento con cuantizacion de 4 bits, aunque la ausencia de documentacion limita la reproducibilidad.
- Pruebas de integracion de PEFT en pipelines de inferencia: permite validar la carga de adaptadores safetensors en frameworks compatibles con PEFT.
- Comparacion de adaptadores sobre Llama 3 8B: puede emplearse como punto de referencia en estudios comparativos de adaptadores, siempre que se documenten sus resultados.
- Docencia y formacion: ejemplo de repositorio de adaptador LoRA con metadatos minimos, util para ilustrar buenas y malas practicas de documentacion de modelos.
- Prototipado interno no critico: solo si se valida previamente el comportamiento del adaptador, dado que no hay evaluacion publicada ni licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Llama 3 8B en 4 bits requiere aproximadamente 5-6 GB de VRAM; el adaptador anade una carga adicional modesta, aunque el tamano del repositorio (15,5 GB) sugiere pesos del adaptador de mayor precision.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o H100 para inferencia comoda; GPUs con 8 GB o mas podrian ser suficientes con el modelo base en 4 bits.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, siempre que se use el modelo base cuantizado.
- Opciones de despliegue: PEFT con transformers, llama.cpp (si se fusiona y convierte el adaptador), vLLM y TGI (previa fusion del adaptador con el modelo base). No hay confirmacion de compatibilidad con Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| zaddyzaddy/soro | Adaptador sobre Llama 3 8B (~8.000 M en base) | no disponible | no disponible | safetensors (PEFT) | 9 descargas |
| unsloth/llama-3-8b-bnb-4bit | ~8.000 M | 8.192 tokens (Llama 3) | Llama 3 Community License | safetensors (4 bits) | Amplia |
| meta-llama/Meta-Llama-3-8B | ~8.000 M | 8.192 tokens | Llama 3 Community License | safetensors | Muy amplia |
| Adaptadores LoRA publicos sobre Llama 3 8B | variable | heredado | variable | safetensors (PEFT) | variable |

La comparativa se limita a caracteristicas estructurales, ya que no hay datos de rendimiento del modelo evaluado.

## Limitaciones y advertencias

- Model card vacia: no hay informacion sobre datos de entrenamiento, evaluacion, sesgos ni uso previsto, lo que impide una evaluacion responsable.
- Licencia no declarada: no se puede confirmar el uso comercial; ademas, el modelo base Llama 3 esta sujeto a la Llama 3 Community License, cuyos terminos se heredan.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; sin evaluacion especifica del adaptador.
- Sesgos conocidos: no documentados; se heredan los del modelo base Llama 3 8B.
- Idiomas: no declarados; el comportamiento multilingue del adaptador es desconocido.
- Contexto: no confirmado en la model card; el valor de 8.192 tokens corresponde al modelo base y no esta verificado para el adaptador.
- Reproducibilidad: imposible sin datos de entrenamiento ni hiperparametros.
- Advertencia de produccion: no debe desplegarse en entornos productivos sin una evaluacion previa propia y sin aclarar la licencia.
- El repositorio incluye una linea canary ("I42FLIPMARKER7B2E unique canary line for index staleness test 1127") que sugiere contenido de prueba o artefactos de indexacion, lo que refuerza la falta de madurez del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/zaddyzaddy/soro
- Modelo base: https://huggingface.co/unsloth/llama-3-8b-bnb-4bit
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Libreria PEFT: https://github.com/huggingface/peft
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact
