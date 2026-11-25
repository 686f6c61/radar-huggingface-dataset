# yuhuanstudio/Yunmo-Next-1B-Instruct-MLX-4bit

## Resumen

Yunmo-Next-1B-Instruct-MLX-4bit es la version cuantizada a 4 bits en formato MLX del modelo Yunmo-Next-1B-Instruct, desarrollado por yuhuanstudio. Se trata de un checkpoint de investigacion de aproximadamente 1.014 millones de parametros, disenado para ejecutarse en Apple Silicon mediante la libreria MLX. Su interes tecnico radica en que implementa una arquitectura poco habitual (Kimi Delta Attention, atencion con query agrupadas y enrutamiento por profundidad) que no forma parte de `mlx-lm`, por lo que el repositorio incluye una implementacion MLX autocontenida en el directorio `yunmo_next_mlx/`.

El modelo esta pensado como material de investigacion sobre arquitecturas alternativas de atencion y enrutamiento, no como un asistente listo para produccion. El propio autor advierte que el modelo esta "a nivel de azar" en preguntas de conocimiento de opcion multiple, falla con frecuencia en datos facticos, puede repetirse hasta alcanzar el limite de tokens y carece de ajuste de seguridad. Su licencia es Apache-2.0, aunque algunas fuentes de fine-tuning imponen condiciones adicionales.

La relevancia actual es limitada pero especifica: sirve como referencia reproducible para validar implementaciones MLX frente a PyTorch, y como banco de pruebas de KDA y depth routing en un modelo de 1B. El repo ocupa 0,7 GB y los pesos cuantizados pesan 0,67 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Kimi Delta Attention (KDA), grouped-query attention y depth routing |
| Parametros totales | 1.013.956.456 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine, group size 64 (pesos); capas no cuantizadas: embedding/output atados, norms, convoluciones cortas, parametros de decaimiento KDA (`A_log`, `dt_bias`) y parametros del depth-router |
| Idiomas soportados | zh, en (etiqueta `traditional-chinese`) |
| Licencia | Apache-2.0 (con condiciones adicionales en algunas fuentes de fine-tuning) |
| Formato de pesos | safetensors (MLX), libreria `mlx` |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con tres elementos distintivos: Kimi Delta Attention (KDA), atencion con query agrupadas (GQA) y enrutamiento por profundidad (depth routing). KDA es un mecanismo de atencion con decaimiento que introduce parametros propios (`A_log`, `dt_bias`) que no se cuantizan en esta version. El depth routing anade parametros de enrutamiento que tampoco se cuantizan. Las anchuras SwiGLU se rellenan con ceros hasta un multiplo de 64 para permitir cuantizar todas las capas lineales, sin alterar la funcion del modelo.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF/DPO) en la informacion proporcionada; el autor remite a la model card del repositorio de precision completa (Yunmo-Next-1B-Instruct) para esos detalles. Si se sabe que entre las fuentes de fine-tuning figuran AM-Thinking-v1 y destilaciones de AM-DeepSeek-R1 (solo investigacion), tw-instruct-500k (CC BY-NC-SA 4.0), no_robots (CC BY-NC 4.0) y algunos subconjuntos de las trazas FABLE.5 (AGPL-3.0).

## Capacidades

- Generacion de texto conversacional en chino (incluido tradicional) e ingles.
- Razonamiento y respuesta a instrucciones mediante plantilla de chat (`encode_chat` reproduce exactamente los token IDs de la plantilla de `transformers` con el razonamiento desactivado).
- Modo de razonamiento desactivable en la plantilla de chat.
- Capacidad de conocimiento factico: limitada; el autor indica que esta a nivel de azar en opcion multiple de conocimiento.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision, audio: no disponible.
- Capacidades multilingues: limitadas a zh y en.

## Casos de uso

- Investigacion sobre mecanismos de atencion: validar y experimentar con Kimi Delta Attention y depth routing en un modelo de 1B ejecutable en Apple Silicon, comparando comportamiento frente a arquitecturas transformer estandar.
- Validacion de portabilidad MLX frente a PyTorch: usar la tabla de bits por byte y la coincidencia de tokens iniciales en decodificacion greedy para verificar que una implementacion MLX reproduce fielmente el modelo de referencia en FP32.
- Prototipado de pipelines de generacion de texto en local: ejecutar inferencia en un Mac sin GPU dedicada para probar plantillas de chat, tokenizacion y flujos de decodificacion antes de escalar a modelos mayores.
- Docencia y demostraciones: ilustrar en clase o taller el efecto de la cuantizacion a 4 bits sobre la fidelidad de la decodificacion (64/64 tokens identicos en chino e ingles con pesos Base, 19/64 en chat con pesos Instruct).
- Experimentos de cuantizacion: analizar el impacto de excluir ciertas capas (norms, convoluciones, parametros KDA y depth-router) de la cuantizacion, usando el modelo como caso de estudio reproducible.
- Evaluacion de riesgos en modelos pequenos sin alineacion: estudiar patrones de repeticion hasta el limite de tokens y errores facticos como referencia para disenar filtros o metricas de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor proporciona metricas de fidelidad de la cuantizacion frente a la version PyTorch en FP32:

Bits por byte de los pesos Base sobre los primeros 50 articulos de Wikipedia en chino (creados despues de 2026-10-01, primeros 2.000 caracteres), frente a PyTorch Base FP32 (0,9174):

| Pesos | Bits por byte | Delta vs PyTorch FP32 |
|---|---:|---:|
| MLX FP32 | 0,9174 | +0,0000 |
| MLX BF16 | 0,9175 | +0,0001 |
| MLX 8-bit | 0,9175 | +0,0001 |
| MLX 4-bit | 0,9254 | +0,0080 |

Tokens iniciales identicos a PyTorch FP32 en decodificacion greedy (64 tokens nuevos):

| Pesos MLX | Chino (Base) | Ingles (Base) | Chat (Instruct) |
|---|---:|---:|---:|
| FP32 | 64 / 64 | 64 / 64 | 64 / 64 |
| BF16 | 64 / 64 | 64 / 64 | 42 / 64 |
| 8-bit | 64 / 64 | 64 / 64 | 42 / 64 |
| 4-bit | 64 / 64 | 27 / 64 | 19 / 64 |

Toda la validacion se ejecuto en Linux con los backends CUDA y CPU de MLX; no se ha comprobado ni la correccion ni la velocidad en Apple Silicon, y el bucle de decodificacion no esta optimizado para velocidad.

## Requisitos de hardware

- VRAM/RAM estimada: los pesos 4-bit ocupan 0,67 GB; el repositorio completo, 0,7 GB. La inferencia requiere ademas memoria para el estado de atencion, KV cache y buffers intermedios, no cuantificada en la informacion disponible.
- GPU recomendadas: no disponible; el modelo esta orientado a Apple Silicon (MLX), aunque la validacion se hizo con backends CUDA y CPU de MLX en Linux.
- Cabe en GPU de consumo: si, por tamano de pesos (0,67 GB en 4 bits) deberia caber en cualquier GPU consumer moderna; no se especifican modelos concretos.
- Opciones de despliegue: MLX con la implementacion propia del repositorio (`python -m yunmo_next_mlx.generate` o API `load`/`generate`). No es compatible con `mlx-lm`, vLLM, llama.cpp, Ollama ni TGI segun la informacion disponible.
- Latencia y throughput: no disponibles; el autor indica que el bucle de decodificacion no esta optimizado para velocidad.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria. Comparacion estructural orientativa:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Yunmo-Next-1B-Instruct-MLX-4bit | 1.014 M | no disponible | Apache-2.0 (con condiciones en fuentes de fine-tuning) | MLX, repo propio |
| Yunmo-Next-1B-Instruct (base) | 1.014 M | no disponible | Apache-2.0 | PyTorch/transformers |
| Alternativas de ~1B (p. ej. familias Llama, Qwen, Gemma) | ~1B | no disponible en esta ficha | variable | amplia (vLLM, llama.cpp, Ollama, TGI) |

No se dispone de datos de rendimiento comparables para establecer diferencias de calidad frente a esos modelos.

## Limitaciones y advertencias

- Checkpoint de investigacion: el autor lo califica explicitamente como tal; no es apto para uso en produccion sin evaluacion adicional.
- Conocimiento factico: a nivel de azar en opcion multiple de conocimiento y con errores frecuentes en datos facticos.
- Repeticion: puede repetirse hasta alcanzar el limite de tokens.
- Sin ajuste de seguridad: no hay alineacion de seguridad; puede generar contenido inapropiado.
- Fidelidad de la cuantizacion 4-bit: solo 27/64 tokens iniciales identicos a FP32 en ingles (Base) y 19/64 en chat (Instruct), frente a 64/64 en FP32, BF16 y 8-bit.
- Idiomas: solo zh y en; sin soporte documentado de otras lenguas.
- Contexto: longitud de contexto no documentada en la informacion disponible.
- Licencia: los pesos son Apache-2.0, pero algunas fuentes de fine-tuning imponen condiciones (AM-Thinking-v1 y destilaciones AM-DeepSeek-R1 solo investigacion; tw-instruct-500k CC BY-NC-SA 4.0; no_robots CC BY-NC 4.0; subconjuntos FABLE.5 AGPL-3.0). Revisar las secciones Data y License del repositorio base antes de uso comercial.
- Validacion limitada: no se ha comprobado correccion ni velocidad en Apple Silicon; el bucle de decodificacion no esta optimizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Instruct-MLX-4bit
- Modelo base de precision completa: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Instruct
- Repositorio del autor en Hugging Face: https://huggingface.co/yuhuanstudio
