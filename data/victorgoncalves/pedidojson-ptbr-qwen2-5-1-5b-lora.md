# VictorGoncalves/pedidojson-ptbr-qwen2.5-1.5b-lora

## Resumen

PedidoJSON PT-BR es un adaptador LoRA desarrollado por VictorGoncalves sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, orientado a la extraccion de informacion estructurada en portugues de Brasil. Su tarea concreta es convertir un pedido de comida escrito en texto libre, junto con un menu de referencia, en un objeto JSON validado que incluye items, cantidades, tamanos, extras, eliminaciones, observaciones y una lista explicita de productos no encontrados en el menu. El adaptador resuelve el problema de pasar de lenguaje natural conversacional a datos estructurados fiables en el dominio de reparto de comida, un caso tipico de integracion entre interfaces conversacionales y sistemas de gestion de pedidos.

El modelo se distribuye como adaptador PEFT (formato safetensors, 70,5 MB) y requiere cargar el modelo base Qwen2.5-1.5B-Instruct. Se entreno exclusivamente con datos sinteticos generados por reglas (4000 pedidos, 120 menus), con 2 epocas y 500 pasos sobre una unica NVIDIA GeForce RTX 3060. La relevancia actual reside en que demuestra que un ajuste fino ligero sobre un modelo pequeno puede llevar el acierto exacto en extraccion estructurada del 0,6 % (base zero-shot) al 85,8 %, con un 100 % de JSON valido y un 96,5 % de F1 en items.

La licencia es Apache 2.0 tanto para el adaptador como para el modelo base, lo que facilita su uso comercial. El idioma soportado declarado es unicamente portugues (pt), y no se han publicado resultados sobre datos reales, solo sobre el conjunto de test sintetico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-1.5B-Instruct |
| Parametros totales | No disponible para el adaptador; modelo base Qwen2.5-1.5B-Instruct con 1,5 mil millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; limite de entrenamiento 1536 tokens (media 817, maximo 1073) |
| Tipos de cuantizacion | No disponible (el adaptador se entrena y evalua en bf16) |
| Idiomas soportados | Portugues de Brasil (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA con rango r=16, alpha=32, dropout=0,05 y modulos all-linear sobre el modelo base Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1,5 mil millones de parametros. El entrenamiento se realizo en bf16 con gradient checkpointing, batch efectivo de 16 (2 x acumulacion 8), learning rate de 0,0002 con scheduler coseno y warmup del 5 %, durante 2 epocas y 500 pasos con semilla 42. El pico de VRAM fue de 7,96 GB reservada y 5,4 GB alocada, con el proceso limitado a 8,0 GB, y el tiempo total de entrenamiento fue de 110,2 minutos en una RTX 3060. La loss de validacion final fue de 0,0100.

Los datos de entrenamiento son 4000 pedidos sinteticos sobre 120 menus, generados por reglas escritas manualmente de forma que el texto y la etiqueta se crean conjuntamente (etiqueta correcta por construccion). El conjunto incluye casos con items fuera del menu (992), terminos ambiguos (454), tamano omitido (903) y errores de tipografia (1392). No se menciona uso de RLHF ni DPO; el ajuste es supervisado sobre pares entrada-salida. El prompt de sistema exacto utilizado durante el entrenamiento esta en `pedidojson/prompt.py` del repositorio del proyecto, y la salida se valida con `pedidojson/guardrails.py` (validacion Pydantic, comprobacion de productos contra el menu y reintento si la salida es invalida).

## Capacidades

- Extraccion de informacion estructurada: convierte texto libre en portugues de Brasil en JSON con esquema validado (items, cantidades, tamanos, extras, eliminaciones, observaciones).
- Deteccion de items no encontrados: genera una lista explicita `nao_encontrados` con productos del pedido que no figuran en el menu proporcionado.
- Manejo de ambiguedades y errores de tipografia: entrenado con terminos ambiguos y errores de escritura en los pedidos.
- Manejo de tamano omitido: reconoce pedidos sin tamano explicito y los representa segun el esquema.
- Generacion de texto conversacional: heredada del modelo base Qwen2.5-1.5B-Instruct (pipeline text-generation).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para el adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible; el adaptador esta especializado en una tarea de extraccion de un solo paso.
- Capacidades multilingues: limitadas al portugues (pt) segun la model card.
- Capacidades especiales: no se declaran modos de pensamiento, vision ni audio.

## Casos de uso

- Toma de pedidos en interfaces conversacionales: el adaptador recibe el menu del restaurante y el mensaje del cliente y devuelve el JSON del pedido listo para el sistema de gestion, con items, cantidades y extras. Es adecuado porque fue entrenado exactamente con el formato "CARDAPIO: ... PEDIDO: ...".
- Integracion con chatbots de reparto de comida: se puede encadenar tras un bot conversacional para transformar la conversacion en un pedido estructurado y validado antes de enviarlo a cocina.
- Deteccion de productos inexistentes en el menu: la lista `nao_encontrados` permite al sistema pedir aclaracion al cliente cuando menciona productos que no estan en la carta, con un recall del 84,1 % en el test sintetico.
- Normalizacion de pedidos con errores de escritura: el modelo fue entrenado con 1392 ejemplos con errores de tipografia en el split de entrenamiento, por lo que tolera faltas de ortografia habituales en el texto del cliente.
- Procesamiento por lotes de pedidos historicos: al ser un modelo de 1,5B con adaptador de 70,5 MB, puede desplegarse en infraestructura modesta para convertir registros de texto libre en datos estructurados para analitica.
- Prototipado rapido en entornos con GPU de consumo: el adaptador se entreno en una RTX 3060 con menos de 8 GB de VRAM, por lo que es viable desarrollar y desplegar en hardware de gama media.
- Validacion con guardrails en produccion: combinado con la validacion Pydantic y la comprobacion contra el menu del proyecto, reduce el producto alucinado al 0,0 % en el test sintetico.

## Benchmarks y rendimiento

Test sintetico con menus no vistos en entrenamiento (n = 500; 1190 items en el oro, 189 terminos en `nao_encontrados` en el oro). Decodificacion greedy, repetition_penalty=1,0, max_new_tokens=512.

| Sistema | JSON valido | Schema ok | Acierto exacto | Item P | Item R | Item F1 | Producto alucinado | Recall no encontrados |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Base zero-shot | 97,4 % | 16,8 % | 0,6 % | 29,5 % | 7,4 % | 11,8 % | 26,5 % | 1,1 % |
| Base few-shot (3 ej.) | 100,0 % | 94,4 % | 16,8 % | 52,8 % | 46,0 % | 49,1 % | 15,5 % | 23,3 % |
| Fine-tunado (LoRA) | 100,0 % | 100,0 % | 85,8 % | 96,9 % | 96,2 % | 96,5 % | 0,3 % | 84,1 % |
| Fine-tunado + guardrails | 100,0 % | 100,0 % | 86,2 % | 97,2 % | 96,2 % | 96,7 % | 0,0 % | 85,2 % |

Latencia por pedido en segundos (media / p95, batch = 1):

| Sistema | GPU (RTX 3060) | CPU (14 hilos) |
|---|---:|---:|
| Base zero-shot | 1,96 / 3,92 | 26,25 / 61,65 |
| Base few-shot (3 ej.) | 2,15 / 3,93 | 35,00 / 54,08 |
| Fine-tunado (LoRA) | 2,06 / 3,32 | 26,94 / 45,98 |
| Fine-tunado + guardrails | 2,04 / 3,41 | 26,92 / 45,96 |

En el sistema con guardrails, las reintentos fueron del 0,0 % y el fallback vacio del 0,0 %. La latencia se midio sobre los primeros 50 pedidos del test en GPU y 10 en CPU, incluyendo tokenizacion y, en el sistema con guardrails, el postprocesamiento. En los sistemas fine-tunados el adaptador LoRA se fusiono al modelo antes de medir.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento uso 7,96 GB de pico en bf16 con gradient checkpointing sobre una RTX 3060. La inferencia en bf16 de un modelo de 1,5B requiere del orden de 3-4 GB, aunque este dato no se aporta en la informacion.
- GPU recomendadas: NVIDIA GeForce RTX 3060 (usada para entrenamiento y evaluacion); GPU de gama media con al menos 8 GB de VRAM para entrenamiento. Para inferencia, cualquier GPU consumer con suficiente VRAM para el modelo base en bf16.
- Cabe en GPU consumer: si, la RTX 3060 se uso tanto para entrenar como para evaluar.
- Opciones de despliegue: el ejemplo oficial usa `transformers` + `peft` (`PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible; al ser un adaptador PEFT, requiere fusion o carga junto al modelo base.
- Latencia y throughput: 2,06 s de media y 3,32 s de p95 por pedido en GPU (RTX 3060, batch = 1, adaptador fusionado); 26,94 s de media y 45,98 s de p95 en CPU de 14 hilos. No se proporcionan datos de throughput con lotes mayores.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos o adaptadores de extraccion estructurada en la informacion disponible. La unica comparacion aportada es interna, entre el modelo base sin ajuste, con few-shot, con el adaptador y con el adaptador mas guardrails (ver seccion de benchmarks).

| Modelo | Parametros | Contexto | Acierto exacto (test sintetico) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PedidoJSON PT-BR (LoRA) | 1,5B (base) + adaptador | no disponible | 85,8 % (86,2 % con guardrails) | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct zero-shot | 1,5B | no disponible | 0,6 % | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct few-shot (3 ej.) | 1,5B | no disponible | 16,8 % | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos generados por reglas escritas por una persona: el vocabulario y el estilo de los pedidos reflejan esas reglas, por lo que el rendimiento en pedidos reales puede ser inferior.
- El test sintetico es un techo: el generador escribe texto y etiqueta con las mismas reglas, de modo que los numeros de evaluacion no deben extrapolarse a produccion sin validacion adicional.
- No hay test real publicado: todos los resultados proceden del conjunto sintetico.
- El 0,0 % de producto alucinado con guardrails esta garantizado por construccion (el guardrail mueve a `nao_encontrados` todo producto ausente del menu); el merito del entrenamiento es la mejora del sistema few-shot al fine-tunado.
- El error residual no se manifiesta como alucinacion sino como sustitucion: un item fuera del menu puede mapearse a uno parecido que si existe (por ejemplo, "breja" a una cerveza del menu), lo que penaliza el recall de `nao_encontrados` (84,1 % sin guardrails, 85,2 % con ellos).
- Ruido conocido en las etiquetas: en una pequena parte de los pedidos, "lata" o "acai" se etiqueto como producto especifico aunque existiera otro producto con esa palabra en el nombre (por ejemplo, Cerveja Brahma Lata, Barca de Acai).
- Idioma limitado al portugues de Brasil; no se declara soporte de otros idiomas.
- Requiere cargar el modelo base Qwen2.5-1.5B-Instruct junto con el adaptador; no es un modelo autonomo.
- No se dispone de informacion sobre sesgos, comportamiento con contexto largo mas alla de 1536 tokens ni sobre cuantizacion para despliegue.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/VictorGoncalves/pedidojson-ptbr-qwen2.5-1.5b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset sintetico: https://huggingface.co/datasets/VictorGoncalves/pedidojson-ptbr-sintetico
- Demo (Space): https://huggingface.co/spaces/VictorGoncalves/pedidojson-ptbr
- Repositorio del proyecto (GitHub): no disponible como URL en la informacion proporcionada; la model card lo referencia como "GitHub (ver o README do projeto)" e indica los ficheros `pedidojson/prompt.py`, `pedidojson/guardrails.py` y `pedidojson/metricas.py`.
