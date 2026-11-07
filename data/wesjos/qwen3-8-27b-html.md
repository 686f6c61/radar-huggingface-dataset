# wesjos/Qwen3.8-27B-HTML

## Resumen

Qwen3.8-27B-HTML es un ajuste fino (fine-tuning) del modelo multimodal denso Qwen3.8-27B, desarrollado por el equipo Qwen de Alibaba y publicado en abierto. El autor del ajuste es el usuario wesjos, que parte del checkpoint cuantizado en 4 bits `unsloth/Qwen3.8-27B-unsloth-bnb-4bit` y entrena con Unsloth y TRL. El modelo resultante conserva la pipeline `image-text-to-text`, es decir, acepta imagenes y texto como entrada y genera texto, y esta orientado a tareas de generacion de HTML, presumiblemente a partir de capturas o descripciones visuales.

El modelo base es un LLM denso (no MoE) de aproximadamente 27.800 millones de parametros, con arquitectura de transformer y capacidad multimodal nativa. La ficha del autor apenas aporta detalles tecnicos mas alla del origen y la licencia, por lo que muchos campos de esta ficha quedan marcados como no disponibles. El repositorio ocupa 55,6 GB en safetensors, lo que es coherente con pesos en precision alta (bf16/fp16) de un modelo de ese tamano.

Su relevancia practica es limitada por ahora: cero descargas, cero likes y una model card minima. Resulta interesante como ejemplo de flujo de ajuste fino con Unsloth sobre un modelo multimodal de 27B, y como punto de partida para quien quiera especializar Qwen3.8-27B en generacion de marcado HTML, pero no debe considerarse un modelo listo para produccion sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (familia qwen3_5, segun tags) |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repo; el modelo base se distribuye en bnb-4bit (bitsandbytes 4 bits) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `unsloth/Qwen3.8-27B-unsloth-bnb-4bit`, que a su vez deriva de Qwen3.8-27B, un modelo denso de ~27,8B parametros de la familia qwen3_5 con capacidad nativa multimodal (entrada de imagen y texto). El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, segun indica el autor, con una aceleracion declarada de 2x respecto a un flujo estandar. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

La model card no documenta hiperparametros, rango de LoRA, precision de entrenamiento ni estrategia de congelacion de capas. Tampoco se detalla como se combino el adaptador con los pesos base ni si el resultado se volvio a fusionar en precision completa. Dado que el punto de partida esta cuantizado en 4 bits, es probable que el ajuste se haya hecho sobre pesos cuantizados (QLoRA), lo que condiciona la fidelidad numerica respecto al modelo original.

## Capacidades

- Generacion de texto a partir de entradas multimodales (imagen y texto), segun la pipeline `image-text-to-text`.
- Generacion de HTML: proposito declarado por el nombre del modelo y por el ajuste especifico del autor.
- Conversacion multi-turno: el tag `conversational` indica soporte de formato de chat.
- Razonamiento y codigo: heredados del modelo base Qwen3.8-27B, que segun el repositorio oficial destaca en coding, flujos agenticos y automatizacion de oficina.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible para este ajuste concreto.
- Capacidades multilingues: limitadas al ingles segun el campo `language` de la model card.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Generacion de HTML a partir de capturas de pantalla: el modelo recibe una imagen de una interfaz o maqueta y produce marcado HTML; es el caso de uso central del ajuste y el que justifica su nombre.
- Prototipado rapido de interfaces: convertir bocetos o wireframes en esqueletos HTML para que un equipo de frontend los refine, reduciendo el trabajo manual inicial.
- Migracion de disenos a codigo en pipelines de documentacion: procesar lotes de imagenes de referencia y generar fragmentos HTML reutilizables en un CMS o generador de sitios estaticos.
- Extraccion estructurada de contenido visual: transcribir tablas, formularios o listados de una imagen a etiquetas HTML semanticas (`<table>`, ``, `<ul>`), util para digitalizacion de documentos.
- Asistencia en entornos de bajo codigo: integrar el modelo como backend de un editor visual que traduzca descripciones e imagenes en bloques HTML editables.
- Generacion de correos HTML y plantillas de marketing: dado un diseno de referencia, producir plantillas con estructura compatible con clientes de correo, siempre con revision humana posterior.
- Educacion y demostraciones tecnicas: ejemplo didactico de ajuste fino multimodal con Unsloth y TRL sobre un modelo de 27B, util en cursos y talleres de fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas propias del ajuste, y los resultados del modelo base Qwen3.8-27B no se han proporcionado en la informacion consultada, por lo que no se presentan cifras que no puedan verificarse.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 56 GB solo para pesos, mas memoria para cache KV y activaciones; se recomienda un minimo de 64-80 GB.
- Cuantizacion a 8 bits: aproximadamente 28-30 GB de pesos, viable en una GPU de 40-48 GB (A100 40GB, L40S, RTX 6000 Ada).
- Cuantizacion a 4 bits: aproximadamente 14-16 GB de pesos, lo que permite ejecucion en GPUs de consumo con 24 GB (RTX 3090, RTX 4090) con margen ajustado para contexto corto.
- GPU recomendadas: A100 80GB o H100 80GB para precision completa y contextos largos; A100 40GB o L40S para 8 bits; RTX 4090 para 4 bits.
- Despliegue: transformers (libreria declarada), text-generation-inference (tag `endpoints_compatible`), y previsiblemente vLLM y llama.cpp si se generan pesos GGUF, aunque no se confirma en la informacion disponible.
- Latencia y throughput: no disponibles. Al tratarse de un modelo denso de 27,8B, el throughput sera sustancialmente menor que el de un MoE con parametros activos reducidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-HTML (este) | ~27,8B denso | no disponible | imagen + texto | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3.8-27B (base) | ~27,8B denso | no disponible | imagen + texto | Apache 2.0 | Hugging Face y GitHub oficial |
| unsloth/Qwen3.8-27B-unsloth-bnb-4bit | ~27,8B denso | no disponible | imagen + texto | Apache 2.0 | Hugging Face |
| wesjos/Qwen3.8-27B-Mario-HTML-LoRA | no disponible | no disponible | imagen + texto | no disponible | Hugging Face |

La comparacion con alternativas de otros fabricantes (por ejemplo, modelos densos multimodales de 20-30B de Mistral, Meta o Google) no puede completarse con datos verificables en la informacion proporcionada, por lo que se omite.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay informacion sobre datos de entrenamiento, evaluacion, sesgos ni limitaciones conocidas, lo que impide valorar su calidad de forma objetiva.
- Riesgo de alucinacion alto en tareas de generacion de HTML: puede producir etiquetas, atributos o clases CSS inexistentes, o estructuras que no corresponden a la imagen de entrada.
- Entrenado sobre un checkpoint cuantizado en 4 bits: la fidelidad respecto al modelo original puede verse degradada, y el comportamiento numerico puede diferir del esperado en bf16.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas sin medir previamente.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar las condiciones del modelo base y de los datos usados en el ajuste.
- Sin adopcion: cero descargas y cero likes en el momento de la consulta, por lo que no hay evidencia de la comunidad sobre su funcionamiento real.
- No validado para produccion: no se han publicado pruebas de robustez, seguridad ni evaluaciones de sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wesjos/Qwen3.8-27B-HTML
- Modelo base cuantizado: https://huggingface.co/unsloth/Qwen3.8-27B-unsloth-bnb-4bit
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
- Ficha de referencia del ajuste relacionado: https://free2aitools.com/model/wesjos/qwen3.8-27b-mario-html-lora
