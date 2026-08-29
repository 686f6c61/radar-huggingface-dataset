# thelawlessone/quasar-15b

## Resumen

QUASAR (Quantitative Analysis of System and Asset Reality) es un adaptador LoRA de 36,9 millones de parámetros entrenado sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Lo desarrolla el usuario thelawlessone y está diseñado para razonar sobre la economía de la Gravitas Reality Network, una red ficticia o de nicho con su propia tokenómica. El modelo responde en lenguaje natural a preguntas sobre valor de tareas de realidad, escasez de observación (PoHP), ventanas de emisión, destrucción (The Almighty) y recompensas de cómputo (PoGW), siempre anclado a documentos canónicos del proyecto.

A pesar de su nombre "quasar-15b", no se trata de un modelo de 15 mil millones de parámetros, sino de un adaptador LoRA sobre un modelo de 1,5 mil millones. El repositorio contiene únicamente los pesos del adaptador (0,2 GB), no el modelo completo. Su relevancia radica en ser un ejemplo de fine-tuning eficiente con LoRA para dominios muy específicos, con reglas explícitas para evitar alucinaciones y especulaciones sobre el valor de los tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-1.5B-Instruct) + LoRA |
| Parametros totales | 1,5 mil millones (base) + 36,9 millones (adaptador) |
| Parametros activos | 36,9 millones (solo adaptador) |
| Longitud de contexto | No disponible (hereda la del modelo base, tipicamente 32 768 tokens) |
| Tipos de cuantizacion | No disponible (entrenado en fp16, sin cuantizar) |
| Idiomas soportados | No disponible (el modelo base soporta varios, pero el adaptador esta entrenado en un corpus especifico) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA con r=32 y alpha=64, lo que representa un 2,34 % de los parámetros del modelo base (36,9 millones). Se entrenó en Windows con precisión fp16 en una RTX 3090 de 24 GB, sin cuantización. El conjunto de datos, `thelawlessone/quasar-corpus`, contiene 593 ejemplos específicos de la economía de la Gravitas Reality Network. Se realizaron 3 épocas con una pérdida media que descendió de 0,57 a 0,25 y finalmente a 0,19. No se menciona el uso de RLHF ni DPO; el entrenamiento es un fine-tuning supervisado estándar con LoRA.

## Capacidades

- Generación de texto en lenguaje natural sobre la economía de la Gravitas Reality Network.
- Razonamiento sobre conceptos específicos: valor de tareas de realidad, escasez de observación (PoHP), ventanas de emisión, destrucción (The Almighty) y recompensas de cómputo (PoGW).
- Respuestas ancladas a documentos canónicos (WHITEPAPER, TOKENOMICS, REALITY_CONSENSUS_V2).
- Regla de honestidad: se niega a especular sobre el valor de los tokens.
- No se mencionan capacidades de tool calling, visión, audio ni razonamiento multi-paso general.
- El modelo base Qwen2.5-1.5B-Instruct sí tiene capacidades multilingües y de chat, pero el adaptador está especializado en un dominio muy concreto.

## Casos de uso

- Consultas sobre tokenómica de la red: un usuario puede preguntar cuánto HORIZON gana un nodo en una región con 400 observaciones, y el modelo responde con los números reales del corpus.
- Análisis de escasez de observación: el modelo explica cómo funciona el mecanismo PoHP y su impacto en las recompensas.
- Simulación de escenarios económicos: dado un conjunto de parámetros, el modelo calcula o describe las emisiones esperadas.
- Documentación interactiva: sirve como asistente para desarrolladores que integran la red, respondiendo preguntas sobre el protocolo sin necesidad de leer los documentos completos.
- Verificación de consistencia: al estar entrenado con reglas estrictas, puede usarse para comprobar si ciertas afirmaciones sobre la economía son coherentes con los documentos canónicos.
- Chat especializado en la comunidad de la red: integrable en un bot de Discord o Telegram para resolver dudas frecuentes sobre el sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluación frente a un conjunto de verificación está pendiente ("Evaluation scores vs verifier set" aparece como no completado).

## Requisitos de hardware

- Inferencia: al ser un adaptador LoRA sobre un modelo de 1,5B, puede ejecutarse en GPUs con 4-6 GB de VRAM en fp16, o incluso en CPU con llama.cpp si se fusiona y cuantiza (aunque el GGUF aún no está publicado).
- GPU recomendada: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 3060) es suficiente para inferencia en fp16.
- Entrenamiento: se realizó en una RTX 3090 de 24 GB, pero con un dataset tan pequeño (593 items) podría entrenarse en GPUs de 8-12 GB.
- Opciones de despliegue: transformers con PEFT (como se muestra en el ejemplo de uso), y próximamente llama.cpp vía GGUF para el backend `/quasar/chat`.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño, la generación es rápida en hardware moderno.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo dominio (economía de redes ficticias). Como referencia, el modelo base Qwen2.5-1.5B-Instruct es un modelo generalista de 1,5B con licencia Apache 2.0, mientras que este adaptador es de nicho y sin licencia especificada. Otros adaptadores LoRA sobre Qwen2.5-1.5B podrían existir, pero no se han encontrado en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de nicho: solo responde correctamente sobre la economía de la Gravitas Reality Network; fuera de ese dominio puede producir respuestas sin sentido o alucinaciones.
- La licencia no está especificada, lo que genera incertidumbre sobre su uso comercial y redistribución.
- El corpus de entrenamiento es muy pequeño (593 items), lo que limita la generalización incluso dentro del dominio.
- No se han publicado evaluaciones formales; el rendimiento real en tareas no vistas es desconocido.
- El nombre "quasar-15b" puede inducir a error: no es un modelo de 15B, sino un adaptador sobre 1,5B.
- No soporta tool calling, visión ni otras capacidades avanzadas del modelo base.
- La regla de "no especular sobre el valor de los tokens" puede limitar su utilidad en contextos donde se requiera análisis predictivo.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/thelawlessone/quasar-15b
- Corpus de entrenamiento (referenciado): thelawlessone/quasar-corpus
- Script de entrenamiento (referenciado): thelawlessone/quasar-training → train_quasar_windows.py
