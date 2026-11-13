# wangming191954/NanoJev-office-v3

## Resumen

NanoJev-office-v3 es un ajuste fino (finetune) del modelo NanoJev publicado por el usuario wangming191954 bajo el paraguas del proyecto ICTAgent. Se trata de un modelo de decisión especializado en la simulación de flujos de oficina (OA, *office automation*), concretamente en la generación de borradores de reembolso de gastos y solicitudes de vacaciones dentro de entornos simulados. El modelo parte del checkpoint C-Tianyu/NanoJev, cuya arquitectura subyacente es Qwen3-0.6B, y sobre él se ha aplicado un LoRA de dominio que posteriormente se ha fusionado en los pesos completos de inferencia.

El modelo no es un LLM generativo de propósito general, sino un `DecisionPredictor` que se carga con el código del repositorio NanoJev y que produce decisiones estructuradas para tareas de OA. El repositorio incluye configuración, tokenizador y ficheros de calibración de confianza para las tareas de oficina, además de los pesos en formato safetensors. El tamaño del repositorio es de 2,4 GB.

Su relevancia es acotada: se trata de una publicación de nicho, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y orientada exclusivamente al idioma chino. Resulta útil como referencia para quienes trabajen con el ecosistema ICTAgent o NanoJev, pero no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B como base, vía NanoJev) |
| Parametros totales | 0,6 mil millones (heredados de Qwen3-0.6B; no se especifica el recuento exacto tras la fusión) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se desconoce si existen versiones GGUF o cuantizadas) |
| Idiomas soportados | chino (zh) |
| Licencia | no disponible (la base Qwen3-0.6B se distribuye bajo Apache 2.0 según la model card) |
| Formato de pesos | safetensors (`best.safetensors`, con SHA256 `8f7fb564801a4b854bd10a167138d7a56ec22e5c0d7240517138503896a8fc2b`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-0.6B, un transformer decoder-only de 0,6 mil millones de parámetros. Sobre esa base, el proyecto NanoJev implementa un componente denominado `DecisionPredictor`, que es el que se carga en inferencia y que convierte el modelo en un predictor de decisiones para tareas acotadas en lugar de un generador de texto libre. El ajuste fino se realizó mediante LoRA sobre escenarios de OA simulados, y posteriormente los pesos del adaptador se fusionaron en el checkpoint completo de NanoJev.

La model card indica que el modelo está orientado a flujos de OA verificados (borradores de reembolso y solicitudes de vacaciones) y que, antes de trasladarlo a otros sistemas de OA, debe evaluarse con las páginas y tareas del sistema destino. Se ha añadido una calibración de confianza específica para las tareas de oficina, publicada junto con los pesos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. La confirmación humana de las decisiones recae en la capa de ejecución de ICTAgent, no en el modelo.

## Capacidades

- Predicción de decisiones estructuradas en flujos de OA simulados: generación de borradores de reembolso de gastos y de solicitudes de vacaciones.
- Carga mediante el `DecisionPredictor` del ecosistema NanoJev, con configuración y tokenizador incluidos en el repositorio.
- Calibración de confianza para las tareas de oficina soportadas, publicada como fichero adicional.
- Integración con la capa de ejecución de ICTAgent, que gestiona la confirmación humana de las decisiones.
- Soporte de idioma chino (zh) exclusivamente.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes autónomos, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Prototipado de flujos de reembolso en un entorno de OA simulado: el modelo genera borradores de solicitud a partir del contexto de la tarea, y la capa de ICTAgent se encarga de la confirmación humana antes de ejecutar cualquier acción.
- Automatización de solicitudes de vacaciones en una demo de OA: el `DecisionPredictor` produce la decisión estructurada correspondiente y el sistema la valida contra las reglas del flujo simulado.
- Evaluación de la viabilidad de modelos pequeños en tareas administrativas: con 0,6 mil millones de parámetros, sirve para medir hasta qué punto un modelo compacto puede cubrir decisiones acotadas frente a un LLM de mayor tamaño.
- Investigación sobre calibración de confianza: los ficheros de calibración incluidos permiten estudiar cómo se comporta la confianza del modelo en tareas de dominio restringido.
- Base para nuevos ajustes LoRA en el ecosistema NanoJev: al estar los pesos fusionados y documentada la estructura, puede servir como punto de partida para adaptar el modelo a otros flujos de oficina, previa evaluación con las páginas y tareas del sistema destino.
- Integración en pipelines de ICTAgent para pruebas de extremo a extremo: el repositorio documenta el despliegue local con Python 3.12 y GPU NVIDIA con soporte CUDA y BF16, lo que permite montar un entorno de pruebas reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 0,6 mil millones de parámetros en BF16, el peso de los pesos ronda 1,2 GB, a lo que hay que sumar el estado de activaciones y el contexto; en la práctica cabría en GPUs de consumo con 8 GB o más, aunque esta estimación no está confirmada por el autor.
- GPU recomendadas: el autor indica un entorno NVIDIA con soporte CUDA y BF16; no especifica modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo base, pero no hay confirmación oficial en la información disponible.
- Opciones de despliegue: el author documenta el despliegue mediante el script `checkpoint.py` de ICTAgent, con activación del checkpoint, `setup.ps1` y `start.ps1 -PromptKey`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| NanoJev-office-v3 | 0,6 B (base Qwen3-0.6B) | no disponible | no disponible | Hugging Face, 0 descargas | Finetune LoRA fusionado para OA simulado, solo chino |
| Qwen3-0.6B | 0,6 B | no disponible en esta ficha | Apache 2.0 | Hugging Face, ampliamente utilizado | Modelo base de propósito general, multilingüe |
| C-Tianyu/NanoJev | no disponible | no disponible | no disponible | Hugging Face | Checkpoint upstream del que deriva este modelo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Ámbito muy restringido: el modelo está entrenado para flujos de OA simulados (reembolsos y vacaciones) y su uso fuera de ese dominio no está validado.
- Solo chino: la model card declara únicamente el idioma zh, sin soporte documentado de otros idiomas.
- Licencia no declarada: no se especifica la licencia del modelo publicado, lo que impide determinar con certeza las condiciones de uso comercial. La base Qwen3-0.6B es Apache 2.0, pero la licencia del finetune no se indica.
- Riesgo de alucinación: no se documentan métricas de fiabilidad ni evaluaciones de alucinación; al tratarse de un modelo de decisión, los errores pueden traducirse en borradores incorrectos que requieren revisión humana.
- Dependencia de la capa de ejecución de ICTAgent: la confirmación humana no la realiza el modelo, sino el sistema que lo integra; desplegarlo sin esa capa elimina la salvaguarda prevista por el autor.
- Evaluación obligatoria antes de migrar a otro sistema de OA: el autor lo indica explícitamente; no debe asumirse transferencia directa a otras plataformas.
- Publicación de nicho: cero descargas y cero likes en el momento de la consulta, sin pipeline declarado ni benchmarks publicados, lo que limita la evidencia disponible sobre su comportamiento.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wangming191954/NanoJev-office-v3
- Modelo base upstream: https://huggingface.co/C-Tianyu/NanoJev
- Código fuente de NanoJev: https://github.com/TianyuCodings/NanoJev
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Instrucciones de despliegue de ICTAgent para NanoJev: https://github.com/OldSaltyFish-Handsome/ICTAgent/blob/main/deploy/nanojev/README.md
- Fichero de licencia de Qwen3-0.6B incluido en el repositorio: LICENSE-Qwen3-0.6B.txt
