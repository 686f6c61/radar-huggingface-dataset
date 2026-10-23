# tianharjuno/Qwen2.5-Coder-1.5B-ANE-ctx2048-LUT6

## Resumen

Qwen2.5-Coder-1.5B-ANE-ctx2048-LUT6 es una conversión de formato del modelo base Qwen/Qwen2.5-Coder-1.5B (1,54 mil millones de parámetros, capable de fill-in-the-middle) a Core ML para ejecutarse íntegramente en el Apple Neural Engine (ANE). No se ha realizado entrenamiento adicional: el autor, tianharjuno, aplica paletización LUT de 6 bits sobre los pesos y divide el grafo en cuatro artefactos (embeddings, transformer en dos bloques y LM head) mediante la herramienta ANEMLL 0.3.5_beta y coremltools 9.0.

El objetivo es muy concreto: habilitar autocompletado de código local y sin conexión al estilo Copilot dentro de VS Code, a través del proyecto ane-fim, que expone un servidor compatible con el endpoint `/infill` de llama.cpp y funciona con la extensión llama.vscode. Es el modelo por defecto de ese servidor y su relevancia radica en que demuestra inferencia de un modelo de código de 1,5B en hardware de consumo Apple Silicon (M3, 16 GB) a ~30 tok/s de decodificación, sin GPU dedicada y sin salir del portátil.

La conversión fija la ventana de contexto en 2048 tokens, emplea un batch de prefill de 64 y calcula el argmax dentro del modelo, lo que restringe la generación a decodificación greedy. El repositorio ocupa 1,4 GB y requiere Apple Silicon con macOS 15 o superior.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (Qwen2.5-Coder base) convertido a Core ML para Apple Neural Engine con ANEMLL 0.3.5_beta |
| Parámetros totales | 1,54 mil millones |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (fija en el momento de la conversión) |
| Tipos de cuantización | Paletización LUT de 6 bits en embeddings, bloques transformer y LM head |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (4 partes: embeddings 169 MB, transformer en 2 chunks de 477 MB cada uno, LM head 169 MB) + `meta.yaml` |
| Batch de prefill | 64 |
| Decodificación | Solo greedy (argmax calculado dentro del modelo) |
| Requisitos de plataforma | Apple Silicon, macOS 15+ |
| Tamaño del repositorio | 1,4 GB (aprox. 1,3 GB de pesos) |
| Conversión | ANEMLL 0.3.5_beta, coremltools 9.0 |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-Coder-1.5B en su variante **base** (no instruct), entrenada por el equipo Qwen de Alibaba Cloud y publicada bajo Apache 2.0. Esta ficha cubre únicamente el artefacto convertido: no hay fine-tuning, RLHF ni DPO adicionales por parte del autor de la conversión, tal como se indica explícitamente en la model card. El pipeline de conversión usa ANEMLL, que trocea el grafo en cuatro segmentos para que quepan y se ejecuten en el Neural Engine, manteniendo una única caché KV compartida entre los dos chunks del transformer.

La innovación técnica relevante no está en el entrenamiento sino en el despliegue: paletización LUT de 6 bits en lugar de cuantización lineal, separación de funciones `infer` y `prefill` por chunk, y cálculo del argmax dentro del modelo para evitar transferencias de logits (a costa de eliminar el muestreo). El resultado es un binario de ~1,3 GB que aprovecha la reutilización de caché KV para prefillar solo los tokens nuevos en cada pulsación de tecla, lo que en tráfico real de editor se traduce en unos 3 tokens nuevos de prefill por keystroke y ~140 ms de respuesta típica.

El prompt es FIM crudo, sin plantilla de chat y sin token BOS: `<|fim_prefix|>{código antes}<|fim_suffix|>{código después}<|fim_middle|>`, con parada en cualquiera de `<|endoftext|>`, `<|fim_pad|>`, `<|file_sep|>`, `<|fim_prefix|>`, `<|fim_suffix|>`, `<|fim_middle|>` o `<|repo_name|>`.

## Capacidades

- Relleno de huecos (fill-in-the-middle) sobre código Python y Swift, que es el caso de uso para el que se validó la conversión.
- Autocompletado de línea completa en editores, con un 57% de coincidencia exacta medida sobre 150 puntos de corte aleatorios en código real posterior a los datos de entrenamiento de Qwen2.5-Coder.
- Generación de texto y código en modo conversacional básico, heredado del modelo base, aunque sin plantilla de chat.
- Prefill incremental gracias a la reutilización de caché KV, adecuado para flujos interactivos por pulsación.
- Inferencia 100% local y offline en Apple Silicon, sin llamadas de red.
- Compatibilidad con el protocolo `/infill` de llama.cpp a través del servidor ane-fim.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo "thinking" de forma nativa en esta conversión.
- No soporta muestreo (temperatura, top-p, top-k) porque el argmax se calcula dentro del modelo.

## Casos de uso

- **Autocompletado de código en VS Code**: desplegando el servidor ane-fim (`make start`) y apuntando la extensión llama.vscode al endpoint, el modelo completa líneas en menos de 150 ms con caché KV reutilizada, sin enviar código a ningún servicio externo.
- **Entornos air-gapped o con requisitos de privacidad**: equipos de desarrollo en banca, sanidad o defensa que no pueden usar Copilot en la nube pueden ejecutar esta conversión en un Mac portátil y mantener todo el código en la máquina.
- **Relleno de huecos en pipelines de refactorización**: usar el formato FIM directamente para insertar cuerpos de funciones o resolver marcadores en plantillas de código generadas automáticamente, procesando ficheros por lotes con el servidor local.
- **Generación de docstrings y comentarios inline**: dado que el modelo base está entrenado sobre repositorios, el patrón FIM permite insertar documentación entre la firma de una función y su implementación.
- **Asistente de código para formación y docencia**: permite a estudiantes ver sugerencias generadas localmente en un portátil Mac sin coste de API y con explicación de qué se está enviando al modelo (nada sale del equipo).
- **Prototipado de herramientas de desarrollo sobre ANE**: sirve como referencia para medir latencia y consumo de un LLM de 1,5B en Neural Engine antes de invertir en un modelo mayor o en la versión de 0,5B para hardware más limitado.
- **Servidor `/infill` compatible con llama.cpp**: cualquier cliente existente que hable ese protocolo puede conectarse sin cambios en el código de integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta métricas propias de la conversión, medidas en un único Mac con M3 de 16 GB y macOS 27:

| Métrica | Resultado |
|---|---|
| Autocompletado de línea, coincidencia exacta (150 puntos de corte, Python/Swift) | 57% |
| Similitud de edición en la misma prueba | 0,82 |
| Comparación con el build de 0,5B en la misma prueba | 43% exacto / 0,72 similitud (el 1,5B ganó 23 casos frente a 3 en los que discreparon) |
| Acuerdo con HF FP32 (20 casos FIM, primeros 16 tokens greedy) | 13/20 idénticos; los 7 restantes son código válido, en su mayoría casi empates |
| Velocidad de decodificación | ~30 tok/s |
| Prefill de un prompt de 774 tokens | ~690 ms |
| Latencia típica en tráfico real de editor | ~140 ms, con ~3 tokens nuevos prefillados por pulsación |

## Requisitos de hardware

- **Plataforma**: exclusivamente Apple Silicon (M1/M2/M3/M4) con macOS 15 o superior; no hay ruta de despliegue en CUDA, ROCm ni CPU x86 documentada.
- **Memoria**: la única medición pública es en un M3 con 16 GB de RAM unificada; el peso del modelo (~1,3 GB) más la caché KV de 2048 tokens dejan margen amplio en configuraciones de 16 GB.
- **GPU dedicadas**: no aplica; el modelo está compilado para el Neural Engine, no para A100, H100 ni RTX 4090.
- **Cabe en consumer**: sí, en cualquier Mac con chip de la serie M y al menos 16 GB recomendados.
- **Despliegue**: servidor ane-fim (por defecto apunta a esta carpeta) o las herramientas de ANEMLL (`tests/chat.py --meta .../meta.yaml --no-template`). No hay soporte de vLLM, TGI, Ollama ni llama.cpp con pesos GGUF para esta conversión.
- **Latencia y throughput**: ~30 tok/s de decode, ~690 ms de prefill para 774 tokens, ~140 ms de respuesta típica en editor. Cifras de un solo equipo; no hay datos de otras variantes de chip.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / plataforma | Rendimiento reportado | Licencia |
|---|---|---|---|---|---|
| Qwen2.5-Coder-1.5B-ANE-ctx2048-LUT6 (esta ficha) | 1,54B | 2048 (fijo) | Core ML / ANE | 57% exacto, 0,82 similitud, ~30 tok/s | Apache 2.0 |
| Qwen2.5-Coder-0.5B-ANE-ctx2048-LUT6 | ~0,5B (según denominación del autor) | 2048 (fijo) | Core ML / ANE | 43% exacto, 0,72 similitud | Apache 2.0 |
| Qwen2.5-Coder-1.5B (original en HuggingFace) | 1,54B | No disponible en la información proporcionada (el modelo base admite ventanas mayores que la fijada en la conversión) | safetensors / PyTorch, FP32, BF16 | Sin benchmarks estándar en esta información; usado como referencia FP32 en el test de acuerdo (13/20) | Apache 2.0 |
| Alternativas de autocompletado en local (p. ej. modelos FIM en GGUF para llama.cpp) | No disponible | No disponible | GGUF / CPU-GPU | No disponible | No disponible |

La comparación directa solo es posible frente al build de 0,5B del mismo autor y frente al modelo original sin convertir; no se dispone de datos de otros modelos FIM en formato Core ML para ANE.

## Limitaciones y advertencias

- **Solo decodificación greedy**: el argmax se calcula dentro del modelo, por lo que no se puede aplicar temperatura, top-p ni top-k; no es apto para generación creativa ni para explorar múltiples candidatos.
- **Contexto fijo de 2048 tokens**: insuficiente para razonamiento sobre ficheros grandes o conversaciones largas; está pensado para ventanas locales alrededor del cursor.
- **Modelo base, no instruct**: no sigue instrucciones ni mantiene diálogo estructurado; usar plantilla de chat produciría resultados degradados, ya que el formato esperado es FIM crudo sin BOS.
- **Riesgo de alucinación de código**: como cualquier modelo de código, puede inventar APIs, firmas o imports inexistentes; las sugerencias deben validarse con tests y revisión humana.
- **Sesgos**: no se ha publicado ninguna evaluación de sesgos ni de composición del dataset para esta conversión; los sesgos del modelo base Qwen2.5-Coder se heredan sin cambios.
- **Idiomas**: no hay información sobre idiomas soportados; el rendimiento validado se limita a Python y Swift.
- **Validación limitada**: las métricas provienen de un único Mac (M3, 16 GB, macOS 27) y de 150 puntos de corte; no hay verificación independiente en otros chips ni versiones de macOS.
- **Compatibilidad de plataforma**: requiere Apple Silicon y macOS 15+; no hay fallback a CPU/GPU, lo que rompe la portabilidad respecto a variantes GGUF.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor enlaza a la licencia del modelo base de Qwen; conviene revisar dicha licencia para despliegues en producción.
- **Madurez**: repositorio con 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y poco contrastado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tianharjuno/Qwen2.5-Coder-1.5B-ANE-ctx2048-LUT6
- Modelo base Qwen2.5-Coder-1.5B: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B/blob/main/LICENSE
- Build de 0,5B en Core ML para ANE: https://huggingface.co/tianharjuno/Qwen2.5-Coder-0.5B-ANE-ctx2048-LUT6
- ANEMLL (herramienta de conversión): https://github.com/Anemll/Anemll
- ane-fim (servidor `/infill` compatible con llama.cpp): https://github.com/SorataBaka/ane-fim
- La búsqueda web realizada no devolvió enlaces técnicos relevantes sobre este modelo; no se han incluido resultados no relacionados.
