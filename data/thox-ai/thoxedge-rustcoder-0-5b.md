# Thox-ai/ThoxEdge-RustCoder-0.5B

## Resumen

ThoxEdge-RustCoder-0.5B es un ajuste fino (fine-tune) del modelo Qwen2.5-Coder-0.5B-Instruct desarrollado por THOX.ai, orientado a la generación y compleción de código en Rust. Se trata de un modelo de 494 millones de parámetros (0,5B) entrenado mediante LoRA de rango 32 sobre un corpus público de código Rust bajo licencia Apache-2.0, con 74.606 ejemplos filtrados que producen código. Los pesos del adaptador LoRA se han fusionado en los pesos base, por lo que el repositorio distribuye únicamente safetensors completos.

El modelo está pensado para ocupar el nivel más económico de la pila de enrutamiento de THOX (ThoxRoute) y ofrecer compleción de Rust de bajo coste en entornos de escritorio o servidor. No obstante, el propio autor advierte de que, con 0,5B de parámetros, no es un buen programador de Rust: la mejora medida sobre el modelo base es modesta y el modelo falla aproximadamente siete de cada diez problemas del benchmark HumanEval-Rust.

Su relevancia actual es limitada y muy específica: sirve como ejemplo de ajuste fino pequeño, reproducible y con evaluación ejecutada (compilación y ejecución de aserciones) sobre un modelo base abierto, y como pieza de bajo coste dentro de un stack propietario. La licencia Apache-2.0 y el origen abierto del corpus facilitan su inspección y reutilización, pero su utilidad práctica fuera de ese nicho es reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 494.032.768 (0,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye safetensors (la model card menciona una escala GGUF de unos 260 MB, pero no se incluye en este repo) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, 988.097.824 bytes) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, heredado directamente de Qwen2.5-Coder-0.5B-Instruct. Sobre esos pesos se aplicó un ajuste fino supervisado (SFT) con LoRA de rango 32, entrenado con 74.606 ejemplos filtrados de un corpus público de código Rust con licencia Apache-2.0. Posteriormente, el adaptador LoRA se fusionó en los pesos base, de modo que el checkpoint distribuido no requiere cargar adaptadores adicionales.

No se documentan en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset, ni si hubo fases de RLHF o DPO. La model card menciona un defecto del renderizador de entrenamiento que colocó campos auxiliares de salida dentro del bloque de código en aproximadamente la mitad de las filas de tres categorías de entrenamiento; según el autor, no produjo regresión medida, pero el checkpoint conserva una sensibilidad al prompt que se describe en detalle en la sección de evaluación.

## Capacidades

- Generación y compleción de código en Rust, con especial énfasis en cuerpos de funciones completos.
- Generación de texto conversacional en inglés, heredada del modelo base Instruct.
- Razonamiento y código general (no específicamente Rust) procedente del modelo base Qwen2.5-Coder, aunque el ajuste fino puede haber estrechado ese comportamiento hacia Rust.
- Plantilla de chat incluida (chat_template.jinja), lo que permite uso en modo conversacional además de modo compleción.
- Compatibilidad con text-generation-inference y endpoints compatibles, según los tags del repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada; el modelo está declarado para compleción de código, no para uso agéntico.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- **Autocompletado de Rust en editores y IDE**: el modelo puede sugerir cuerpos de funciones a partir de una firma y un enunciado en lenguaje natural. Es adecuado porque fue entrenado específicamente sobre ejemplos de Rust y funciona con prompts del tipo "Write the complete body of the Rust function below".
- **Generación de fragmentos de código en pipelines de CI/CD**: dado su tamaño reducido (0,5B), puede desplegarse en CPU o GPU modesta para generar borradores de tests o funciones auxiliares que luego pasan por compilación y revisión humana.
- **Prototipado rápido de utilidades Rust**: para snippets de baja criticidad (parseo, manipulación de cadenas, estructuras de datos sencillas) donde el coste de inferencia importa más que la tasa de acierto.
- **Enrutamiento de bajo coste en un stack multi-modelo**: el modelo está diseñado para ocupar el nivel más barato de ThoxRoute; puede usarse como primera pasada y escalar a un modelo mayor cuando la compilación falla.
- **Generación de documentación y comentarios de código Rust**: peticiones en lenguaje natural sobre funciones existentes para producir descripciones o ejemplos de uso.
- **Evaluación y experimentación académica**: como caso de estudio de ajuste fino LoRA reproducible sobre un modelo base abierto, con evaluación ejecutada y delta medido frente al base.
- **Asistencia offline en escritorio**: al ser un modelo de 0,5B, puede ejecutarse localmente en un portátil para tareas de compleción sin conexión, siempre que se acepte su baja tasa de acierto.

## Benchmarks y rendimiento

Evaluación publicada por el autor: MultiPL-E HumanEval-Rust, 156 problemas, ejecutados (compilación y ejecución de aserciones), decodificación greedy, ambos modelos evaluados en el mismo trabajo.

| Modelo | Modo compleción | Modo chat |
|---|---|---|
| Modelo base (Qwen2.5-Coder-0.5B-Instruct) | 21,15% (33/156) | 25,64% (40/156) |
| ThoxEdge-RustCoder-0.5B | 25,64% (40/156) | 28,21% (44/156) |
| Delta | +4,49 pp | +2,57 pp |

El autor indica que el suelo de ruido del harness es de aproximadamente ±1 problema (±0,64 pp), que ambos deltas lo superan y que diferencias inferiores a 1,5 pp deben tratarse como empate. La evaluación es deliberadamente generosa (una respuesta de solo cuerpo o de función completa se acepta si cualquiera de las dos compila), por lo que estos números no son comparables con las tablas públicas de MultiPL-E; la medición válida es el delta entre filas. No se publica resultado GATE49 de THOX para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1 GB para los pesos (988 MB de safetensors), más overhead de activaciones y caché KV; en la práctica, alrededor de 1,5-2 GB.
- En cuantización de 8 bits: en torno a 0,5-0,6 GB de pesos; en 4 bits, unos 0,3 GB, aunque el autor advierte que una gran parte de los parámetros reside en el embedding, que no se cuantiza bien, por lo que la escala GGUF del modelo ocupa unos 260 MB y no cabe en los dispositivos más pequeños de THOX.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090) es suficiente; también A100 y H100, aunque están sobredimensionadas para este modelo.
- Cabe en GPU consumer y en CPU: sí, en la práctica totalidad de GPU consumer modernas e incluso en inferencia por CPU.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp y Ollama no están confirmados en la información disponible, y el repositorio no incluye GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval-Rust (mejor modo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThoxEdge-RustCoder-0.5B | 0,5B | no disponible | 28,21% (chat, harness propio) | Apache-2.0 | Hugging Face, safetensors |
| Qwen2.5-Coder-0.5B-Instruct | 0,5B | no disponible | 25,64% (chat, harness propio) | Apache-2.0 | Hugging Face, safetensors y GGUF |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Modelos Rust-specific de mayor tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el modelo base, del que este checkpoint es un ajuste fino: la mejora medida es de +2,57 pp en modo chat y +4,49 pp en modo compleción, dentro de un harness no comparable con leaderboards públicos. Frente a Qwen2.5-Coder-1.5B-Instruct, el modelo de THOX tiene menos parámetros y, presumiblemente, menor capacidad general, aunque no se dispone de datos de benchmark comparables en la información proporcionada.

## Limitaciones y advertencias

- **Tasa de acierto baja**: falla aproximadamente siete de cada diez problemas de HumanEval-Rust (28,21% pass@1 en su mejor modo); no es un buen programador de Rust y no debe usarse sin revisión humana.
- **Sensibilidad al prompt**: la frase "Complete the Rust code. Output only the missing code." produce fragmentos y baja el resultado al 2,56%, frente al 28,21% con la formulación recomendada ("Write the complete body of the Rust function below."). Es un comportamiento frágil en producción.
- **Defecto del renderizador de entrenamiento**: en aproximadamente la mitad de las filas de tres categorías, campos auxiliares de salida quedaron dentro del bloque de código; el autor afirma que no causó regresión medida, pero el checkpoint conserva la sensibilidad descrita.
- **Idioma**: solo inglés; no hay soporte declarado de castellano ni de otros idiomas.
- **Contexto**: no se documenta la longitud de contexto en la información disponible; no debe asumirse la del modelo base sin verificación.
- **Cuantización**: no se distribuye GGUF en el repositorio y el embedding limita la reducción de tamaño, por lo que no cabe en los dispositivos más pequeños de THOX.
- **Ámbito excluido**: usos médicos, legales, financieros, de seguridad crítica o cualquier decisión de alto riesgo sin revisión humana; control no supervisado de dispositivos físicos sin paso de confirmación.
- **Licencia**: Apache-2.0 permite uso comercial, pero el modelo se distribuye "tal cual", sin garantías; el autor no ofrece soporte ni compromiso de mantenimiento.
- **Sesgos**: no se documentan sesgos específicos en la información proporcionada; al derivar de Qwen2.5-Coder, hereda los sesgos del corpus del modelo base, no evaluados aquí.
- **Riesgo de alucinación**: alto en código, dado el tamaño reducido y la baja tasa de acierto; las APIs o crates inventados son un riesgo plausible en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/ThoxEdge-RustCoder-0.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Benchmark MultiPL-E (referencia del harness): no disponible en la información proporcionada
- Blog o paper de THOX.ai: no disponible en la información proporcionada
- Repositorio de código o demo: no disponible en la información proporcionada
