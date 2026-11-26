# usermma/test

## Resumen

`usermma/test` es un repositorio de conversiones GGUF del modelo `empero-ai/Quark-150M-128K-Zero`, un modelo de chat de investigacion de 165 millones de parametros construido sobre la arquitectura propietaria Quark. El modelo base se entreno mediante tecnicas de aprendizaje por refuerzo (RL/GRPO) partiendo directamente del modelo base, sin fase de SFT (supervised fine-tuning), lo que lo convierte en un artefacto de investigacion sobre alineamiento y razonamiento en modelos de muy pequeno tamano.

El repositorio publica seis variantes cuantizadas (BF16, Q8_0, Q6_K, Q4_K_M, Q3_K_M y Q2_K) junto con una instantanea parcheada del codigo fuente de `llama.cpp` que anade el registro de la arquitectura `quark`. Este parche permite que las herramientas de `llama.cpp` reconozcan, carguen y cuantizen el modelo, pero no implementa el grafo de inferencia completo.

La relevancia de este repositorio es fundamentalmente tecnica y de investigacion: demuestra el proceso de conversion y cuantizacion de una arquitectura hibrida novedosa hacia el formato GGUF, y sirve como base para una futura implementacion de inferencia. No es, hoy, un modelo utilizable para generar texto con herramientas estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Quark (decoder hibrido: capas locales con sliding-window attention + convolucion causal corta, capas globales con GQA) |
| Parametros totales | 165.254.528 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | BF16 (16,15 BPW), Q8_0 (8,72 BPW), Q6_K (6,80 BPW), Q4_K_M (5,07 BPW), Q3_K_M (4,18 BPW), Q2_K (3,50 BPW) |
| Idiomas soportados | ingles (segun model card); resto no disponible |
| Licencia | Apache-2.0 (runtime `llama.cpp` empaquetado bajo MIT) |
| Formato de pesos | GGUF v3 (safetensors en el modelo base) |

## Arquitectura y entrenamiento

`QuarkForCausalLM` es un decoder hibrido compuesto por 12 capas locales y 4 capas globales (una global cada cuatro capas). Las capas locales emplean sliding-window attention con ventana de 256 tokens, RoPE, QK-norm y un attention sink aprendido por cabeza, combinado por canal con una convolucion causal corta de doble compuerta (kernel 4). Las capas globales usan atencion causal completa con grouped-query attention (12 cabezas de query y 4 de clave/valor), tambien con RoPE y QK-norm. El modelo incorpora residuales de valor multi-cabeza con compuerta anclados a la capa 0, residuales "sandwich" escalados por profundidad, embeddings atados y un vocabulario de 32.896 entradas.

El entrenamiento del modelo base se realizo mediante RL/GRPO partiendo del modelo base, sin SFT previo. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni detalles adicionales del proceso de alineamiento en la informacion proporcionada.

El proceso de produccion de estos artefactos fue: descarga del `model.safetensors` en F32 del modelo original, conversion a GGUF mediante un escritor personalizado (arquitectura `quark`, tokenizer BPE byte-level de GPT-2, plantilla de chat preservada) y cuantizacion del maestro F32 con `llama-quantize` del arbol `llama.cpp` parcheado incluido en el repositorio.

## Capacidades

- Generacion de texto conversacional (objetivo declarado del modelo base), aunque **no es ejecutable hoy** con las herramientas estandar.
- Razonamiento derivado de entrenamiento por refuerzo (RL/GRPO), orientado a tareas de investigacion sobre alineamiento.
- Inspeccion, re-cuantizacion y manipulacion de los pesos GGUF mediante herramientas compatibles con GGUF v3.
- Carga y reconocimiento de la arquitectura `quark` con el `llama.cpp` parcheado incluido (registro de arquitectura, no inferencia).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado; resto no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre arquitecturas hibridas: el repositorio permite estudiar como se serializa y cuantiza una arquitectura con sliding-window attention, convolucion causal y attention sinks hacia GGUF, comparando el grafo teorico con el formato de pesos resultante.
- Desarrollo de implementaciones de inferencia: el arbol `llama.cpp` parcheado (4 archivos, +13 lineas) constituye el punto de partida para implementar el grafo directo de Quark (blend de convolucion, residuales de valor, sinks) y habilitar generacion de texto real.
- Distribucion de artefactos de investigacion: las seis variantes cuantizadas (de 318 MiB a 70 MiB) permiten distribuir el modelo con distintos compromisos de tamano y fidelidad numerica.
- Re-cuantizacion y experimentacion numerica: los ficheros GGUF v3 validos admiten cuantizacion adicional con `llama-quantize`, util para medir el impacto de BPW bajos (Q2_K, Q3_K_M) en una arquitectura no estandar.
- Estudio de alineamiento RL sin SFT: el modelo base (RL/GRPO directo desde base) sirve como caso de estudio sobre los efectos de prescindir de SFT en modelos de 165M parametros.
- Pruebas de tooling GGUF: validacion de lectores, inspectores y pipelines de conversion frente a una arquitectura no registrada en el ecosistema upstream (Ollama, LM Studio, llama.cpp stock).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: BF16 en torno a 318 MiB de pesos; Q8_0 unos 173 MiB; Q6_K unos 135 MiB; Q4_K_M unos 101 MiB; Q3_K_M unos 84 MiB; Q2_K unos 70 MiB. El overhead de contexto (hasta 131.072 tokens) y de estados de atencion no esta cuantificado en la informacion disponible.
- GPU recomendadas: no disponible. Por tamano, cualquier GPU consumer con suficiente VRAM para el contexto elegido seria candidata, pero la inferencia no esta implementada.
- Compatibilidad con GPU consumer: previsiblemente si por volumen de pesos, pero **no ejecutable hoy** con `llama.cpp` stock, Ollama ni LM Studio.
- Opciones de despliegue: unicamente el arbol `llama.cpp` parcheado incluido en `llama-cpp-src.tar.gz`, compilado con CMake, para carga y cuantizacion. vLLM, TGI, Ollama y LM Studio no soportan la arquitectura.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de inferencia |
|---|---|---|---|---|
| usermma/test (Quark-150M GGUF) | 165M | 131.072 | Apache-2.0 | Solo carga/cuantizacion con runtime parcheado; sin grafo de inferencia |
| empero-ai/Quark-150M-128K-Zero (base) | 165M | 131.072 | Apache-2.0 | Pesos safetensors; requiere implementacion de la arquitectura Quark |
| Modelos tipo Llama/Qwen de ~150-200M | ~150-200M | variable | variable | Soportados de forma nativa en llama.cpp, Ollama y vLLM |

La comparacion con alternativas de la misma categoria en rendimiento no esta disponible, ya que no se han publicado benchmarks.

## Limitaciones y advertencias

- **Inferencia no implementada**: los GGUF son contenedores validos, pero `llama.cpp` stock, Ollama y LM Studio no pueden generar texto con ellos. El parche solo registra la arquitectura.
- Arquitectura no estandar: cualquier integracion en produccion exige implementar el grafo completo de Quark (conv blend, residuales de valor, attention sinks) en el runtime elegido.
- Modelo de investigacion de 165M parametros: capacidad limitada por escala, con riesgo elevado de alucinacion y baja fiabilidad en tareas complejas.
- Idiomas: solo ingles declarado; el resto no disponible, lo que limita el uso multilingue.
- Sesgos conocidos: no disponible en la informacion proporcionada; cabe esperar sesgos heredados de los datos de entrenamiento del modelo base.
- Licencia Apache-2.0 permisiva para uso comercial, pero el runtime `llama.cpp` empaquetado se distribuye bajo MIT y debe respetarse por separado.
- Contexto de 131.072 tokens declarado: el coste real de memoria y la calidad en contextos largos no estan verificados al no existir inferencia funcional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/usermma/test
- Modelo base: https://huggingface.co/empero-ai/Quark-150M-128K-Zero
- llama.cpp (upstream): https://github.com/ggml-org/llama.cpp
