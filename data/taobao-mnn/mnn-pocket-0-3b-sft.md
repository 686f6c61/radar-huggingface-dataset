# taobao-mnn/MNN-Pocket-0.3B-SFT

## Resumen

MNN-Pocket-0.3B-SFT es el checkpoint intermedio de ajuste supervisado (SFT) de la familia MNN-Pocket, un conjunto de modelos de lenguaje compactos de aproximadamente 300 millones de parametros desarrollados por el equipo taobao-mnn (Alibaba) y disenados conjuntamente con la pila de inferencia MNN para despliegue en dispositivo (on-device). Este checkpoint se situa entre el modelo base preentrenado y el modelo instruct final, y se publica fundamentalmente por motivos de reproducibilidad e investigacion.

El modelo emplea una arquitectura transformer decoder-only de 28 capas, con un tamano oculto de 896, atencion con 14 cabezas y GQA con solo 2 cabezas KV (head_dim 64), FFN de 2560 con activacion SiLU y embeddings de entrada/salida atados. La longitud de contexto nominal es de 32K tokens (40.960 posiciones de embedding) y el vocabulario alcanza los 65.536 tokens.

Su relevancia actual radica en que demuestra que un modelo de ~360 millones de parametros reales puede ejecutarse en telefonos de gama alta (la demo oficial se grabo en un iPhone 18 Pro) manteniendo una plantilla de chat estilo ChatML. No obstante, para uso conversacional en produccion el autor recomienda explicitamente el modelo instruct final, que supera a este checkpoint SFT en la suite de 11 benchmarks (media macro de 50,00 frente a la etapa SFT).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 28 capas |
| Parametros totales | 361.551.232 (~0,36B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32K tokens (40.960 posiciones de embedding) |
| Tipos de cuantizacion | bfloat16 nativo; builds INT4 disponibles en el repo MNN-Pocket-0.3B-MNN y GGUF en MNN-Pocket-0.3B-GGUF |
| Idiomas soportados | Ingles y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,7 GB) |

Detalles adicionales de arquitectura: hidden size 896, 14 cabezas de atencion, GQA con 2 cabezas KV, head_dim 64, FFN intermedio de 2560 con SiLU, vocabulario de 65.536 y embeddings de entrada/salida atados. Precision de entrenamiento/publicacion en bfloat16.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso convencional de 28 capas, sin mezcla de expertos ni mecanismos hibridos SSM. Destaca el uso de Grouped Query Attention agresivo (14 cabezas de consulta frente a solo 2 cabezas de clave/valor), lo que reduce drasticamente el coste de memoria de la cache KV y facilita la inferencia en dispositivos con recursos limitados. Los embeddings estan atados entre entrada y salida, lo que ahorra parametros en un modelo de este tamano.

Este checkpoint corresponde a la etapa de ajuste supervisado (SFT) del pipeline de post-entrenamiento. Segun la model card, la version instruct final anade sobre esta etapa el denominado "SFT Loop Engine" y destilacion on-policy multi-profesor. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo incluye una plantilla de chat estilo ChatML y comparte arquitectura y tokenizador con la version instruct.

## Capacidades

- Generacion de texto conversacional en ingles y chino con plantilla ChatML.
- Razonamiento basico y respuesta a instrucciones, limitado por su escala de ~360M de parametros.
- Capacidad multilingue restringida a ingles y chino.
- Ejecucion en dispositivo (on-device) gracias a la integracion con la pila de inferencia MNN.
- Soporte de cuantizacion INT4 y formato GGUF en los repos derivados de la familia.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido (thinking mode) en la informacion disponible.

## Casos de uso

- Investigacion sobre pipelines de post-entrenamiento: al ser un checkpoint intermedio publicado, permite ablacionar el efecto del SFT y de la destilacion on-policy comparando contra el modelo final.
- Punto de partida para entrenamiento continuado: sirve como base para experimentos de fine-tuning adicional con dominio especifico sin partir del modelo preentrenado.
- Asistentes embebidos en aplicaciones moviles: su tamano de ~0,36B y su integracion con MNN permiten desplegar un chat basico en telefonos de gama alta, como demuestra la demo en iPhone 18 Pro.
- Autocompletado y sugerencias de texto en local: la ventana de 32K tokens y el bajo coste de cache KV por GQA permiten mantener contexto de conversacion o documento en el propio dispositivo.
- Clasificacion y etiquetado de texto ligero en ingles y chino: tareas de extraccion o resumen corto donde no se requiere el modelo instruct completo.
- Prototipado rapido de interfaces conversacionales: validar UX y flujos de chat antes de migrar al modelo instruct final, que es estrictamente superior.
- Educacion y demos de IA en el borde: ejecutar inferencia sin conexion en hardware de consumo para talleres o pruebas de concepto.

## Benchmarks y rendimiento

La model card unicamente aporta un dato agregado: en la suite de 11 benchmarks, el modelo instruct final obtiene una media macro de 50,00, superior a la etapa SFT. No se publican en la informacion disponible los resultados individuales por benchmark (MMLU, HumanEval, GSM8K, etc.) de este checkpoint SFT.

| Metrica | MNN-Pocket-0.3B-SFT | MNN-Pocket-0.3B (instruct) |
|---|---|---|
| Media macro en suite de 11 benchmarks | No disponible (inferior al instruct) | 50,00 |
| Resultados por benchmark individual | No disponible | No disponible |

No se han publicado resultados de benchmarks desglosados en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 0,7-0,8 GB para los pesos, mas la cache KV (muy reducida gracias a GQA con 2 cabezas KV).
- VRAM estimada en INT4: en torno a 0,2-0,3 GB para los pesos, segun el build MNN-Pocket-0.3B-MNN.
- GPU recomendadas: cualquier GPU consumer moderna es sobradamente suficiente; el modelo esta pensado para CPU/GPU movil mediante MNN.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en dispositivos moviles de gama alta.
- Opciones de despliegue: MNN (stack oficial), llama.cpp/Ollama mediante el build GGUF, y transformers con `AutoModelForCausalLM` para prototipado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| MNN-Pocket-0.3B-SFT | ~0,36B | 32K | en, zh | Apache 2.0 | Checkpoint SFT intermedio, orientado a on-device con MNN |
| MNN-Pocket-0.3B (instruct) | ~0,36B | 32K | en, zh | Apache 2.0 | Version final recomendada, media macro 50,00 en 11 benchmarks |
| MNN-Pocket-0.3B-Base | ~0,36B | 32K | en, zh | Apache 2.0 | Checkpoint preentrenado, sin SFT |
| Alternativas de ~0,3-0,5B de otros fabricantes | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- No es el modelo recomendado para uso conversacional: el autor indica que el modelo instruct final es estrictamente mas fuerte; este checkpoint es para reproducibilidad e investigacion.
- Escala muy reducida (~0,36B), lo que limita razonamiento complejo, matematicas y codigo frente a modelos mayores.
- Cobertura linguistica limitada a ingles y chino; el rendimiento en castellano no esta documentado ni garantizado.
- Riesgo de alucinacion inherente a modelos pequenos; no se documentan tasas concretas.
- No se documentan sesgos especificos, pero al derivar de datos web en ingles y chino es probable que herede sesgos de esas fuentes.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse en produccion.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar `LICENSE.txt` y las condiciones de los repos derivados (GGUF, MNN) antes de desplegar.
- El contexto nominal es de 32K, pero no se documenta la degradacion de calidad en ventanas largas para este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-SFT
- Modelo instruct final: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B
- Modelo base: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-Base
- Build GGUF: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-GGUF
- Build MNN INT4: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-MNN
- Modelo de decision no autorregresivo: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-Dec
- Coleccion MNN-Pocket: https://huggingface.co/collections/taobao-mnn/mnn-pocket-03b
- Repositorio MNN en GitHub: https://github.com/alibaba/MNN
- Informe tecnico: https://arxiv.org/pdf/2611.12311
