# TozAI/Toz-1.5

## Resumen

Töz-1.5 es un modelo de lenguaje pequeño (SLM) de 604 millones de parámetros especializado en turco, entrenado desde cero por Töz AI (Ahmet Emin Arnak). Se preentrenó sobre 15.000 millones de tokens en turco (Fineweb-2 filtrado más Wikipedia) y después se ajustó para conversación con un dataset SFT construido desde cero. Su arquitectura es un decodificador estilo Qwen3 (`Qwen3ForCausalLM`) con atención GQA, RoPE y RMSNorm.

El problema que aborda es la escasez de modelos abiertos de calidad en turco: frente a modelos multilingues genéricos, Töz-1.5 emplea un tokenizador de 32k vocabulario entrenado específicamente para turco y datos monolingües, lo que permite un rendimiento razonable con un tamaño muy reducido y una ventana de contexto de 1024 tokens.

Es relevante como ejemplo de modelo nacional/monolingüe eficiente: cabe en hardware de consumo, se distribuye bajo Apache-2.0 en safetensors y ONNX, e incluye un mecanismo de uso de herramientas (calculadora) integrado en el propio formato de chat, algo poco habitual en modelos tan pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador estilo Qwen3 (`Qwen3ForCausalLM`) |
| Parametros totales | 604.062.848 (604M) |
| Parametros activos | no disponible (no se indica si es MoE; todo apunta a modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (se distribuye en float16/float32; pesos en safetensors y ONNX) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX |

Detalle adicional de la arquitectura: hidden size 1152, 32 capas, GQA con 9 cabezas de consulta y 3 cabezas KV (dimensión de cabeza 128), QK-norm, FFN SwiGLU de 4096, RMSNorm, RoPE con θ = 10.000, embeddings atados entrada/salida y sin sesgos.

## Arquitectura y entrenamiento

Töz-1.5 es un transformer decoder denso estilo Qwen3. Usa Grouped Query Attention (9 cabezas de consulta, 3 de KV) con QK-norm para estabilidad del entrenamiento, activación SwiGLU en el FFN (dimensión intermedia 4096), normalización RMSNorm y codificación posicional RoPE (θ = 10.000). Los embeddings de entrada y salida están atados y el modelo no usa sesgos. El vocabulario de 32k tokens fue entrenado específicamente para turco, lo que mejora la eficiencia de tokens frente a tokenizadores multilingües.

El preentrenamiento se realizó sobre 15.000 millones de tokens en turco (Fineweb-2 filtrado más Wikipedia) usando JAX en una TPU v5e-8. Posteriormente se aplicó un ajuste supervisado (SFT) con un dataset construido desde cero, independiente del de su predecesor Töz-1 y orientado a mayor calidad: mejores respuestas en matemáticas con uso de herramientas y menos alucinaciones. No se usaron datos bajo licencias no comerciales. No se menciona entrenamiento con RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en turco con plantilla de chat (`Kullanıcı:` / `Töz:`).
- Instrucciones (instruction following) gracias al SFT específico.
- Matemáticas mediante uso de herramientas: el modelo no calcula aritmética por sí mismo, sino que emite expresiones dentro de `<hesap>…</hesap>`, un evaluador externo calcula el resultado y se inserta en `<sonuc>…</sonuc>` para que el modelo redacte la respuesta final.
- Soporte de stop strings y generación determinista (`do_sample=False`) documentada por el autor.
- Disponible en formato ONNX, lo que facilita inferencia en navegador o entornos sin PyTorch (demo web incluida).
- No hay soporte documentado de vision, audio, function calling genérico ni agentes multi-paso; el tool use se limita a la calculadora.

## Casos de uso

- Chatbots en turco de bajo coste: con 604M de parámetros y contexto de 1024 tokens, es adecuado para asistentes conversacionales sencillos desplegados en CPU o GPU de consumo.
- Aritmética asistida en producción: el bucle de calculadora con aritmética exacta (enteros y fracciones, sin `eval()`) permite respuestas matemáticas fiables en aplicaciones educativas o de atención al usuario.
- Demostraciones en navegador: el formato ONNX y la demo web incluida (toz-chat.onrender.com/sohbet.html) permiten integración client-side sin backend de GPU.
- Corrección y redacción básica en turco: generación de texto monolingüe con tokenizador optimizado para el idioma.
- Investigación en NLP turco: modelo base público (Töz-1.5-Base) y modelo SFT con datos sin restricciones NC, útiles como punto de partida para fine-tuning adicional.
- Educación y aprendizaje del turco: respuestas conversacionales simples con capacidad de cálculo verificable.
- Prototipado de pipelines con tool use en idiomas poco dotados: el formato `<hesap>`/`<sonuc>` sirve como patrón de referencia para integrar herramientas externas en modelos pequeños.

## Benchmarks y rendimiento

El autor publica resultados solo para el modelo preentrenado (Töz-1.5-Base), evaluado en 0-shot con un script propio y comparado contra otros modelos reevaluados con el mismo script. El modelo SFT no fue evaluado por separado. La model card incluye una imagen con los resultados, pero los valores numéricos no están disponibles en el texto extraído.

| Benchmark | Metric | Chance | Töz-1.5-Base |
|---|---|---|---|
| no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks en la informacion disponible (los datos aparecen solo como imagen en la model card).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en float16 y unos 2,4 GB en float32 (604M de parámetros); el repo completo ocupa 2,0 GB. En int8/int4 no hay versiones oficiales publicadas, pero por tamaño cabría en torno a 0,6–0,3 GB si se cuantizara.
- GPU recomendadas: cualquier GPU moderna; no se necesita A100 ni H100. Una RTX 3060 o superior es más que suficiente; también funciona en CPU (el autor recomienda float32 en CPU).
- Consumer GPUs: cabe con holgura en prácticamente cualquier GPU de consumo, incluso en portátiles; también es viable en Raspberry Pi-class hardware con ONNX, aunque sin datos oficiales de latencia.
- Despliegue: transformers (código oficial del autor), ONNX Runtime, endpoints de Hugging Face (tags `text-generation-inference` y `endpoints_compatible`). No hay soporte documentado de vLLM, llama.cpp ni Ollama (no hay GGUF publicado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| Töz-1.5 (TozAI) | 604M | 1024 | Turco | Apache-2.0 | safetensors, ONNX |
| Qwen3 (familia, base de la arquitectura) | desde ~600M (Qwen3-0.6B) | hasta 32k+ | Multilingüe (incl. turco) | Apache-2.0 | safetensors, GGUF |
| Gemma 3 1B (Google) | ~1.000M | 32k+ | Multilingüe | Gemma license (restricciones) | safetensors |
| Llama 3.2 1B (Meta) | ~1.200M | 128k | Multilingüe | Llama Community License | safetensors, GGUF |

Töz-1.5 es notablemente más pequeño y monolingüe que las alternativas, con un contexto mucho más corto (1024 tokens), pero a cambio ofrece un tokenizador optimizado para turco, licencia totalmente permisiva y un tamaño que lo hace accesible en hardware mínimo. Su rendimiento comparativo en turco no puede cuantificarse porque los benchmarks del autor solo están disponibles como imagen.

## Limitaciones y advertencias

- Contexto muy corto: 1024 tokens, insuficiente para documentos largos o conversaciones extensas multi-turno.
- Monolingüe: diseñado para turco; el rendimiento en otros idiomas, incluido el castellano o el inglés, no está documentado y probablemente sea pobre.
- Riesgo de alucinación: el autor indica que la versión 1.5 reduce las alucinaciones respecto a Töz-1, pero no publica métricas del modelo SFT.
- Aritmética: si se omite el bucle de la calculadora, el modelo puede rellenar `<sonuc>` por su cuenta con valores no fiables, especialmente con números grandes. Es imprescindible ejecutar el evaluador externo.
- Sesgos: no documentados por el autor; al entrenarse con datos web en turco (Fineweb-2, Wikipedia), cabe esperar sesgos presentes en esos corpus.
- Benchmarks del modelo SFT no publicados: las evaluaciones corresponden al modelo base, por lo que el rendimiento conversacional real no está cuantificado.
- Licencia: Apache-2.0, sin restricciones para uso comercial.
- Proyecto de autor individual con muy poca tracción (65 descargas, 1 like): madurez, mantenimiento y soporte comunitario limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TozAI/Toz-1.5
- Demo web (chat en navegador): toz-chat.onrender.com/sohbet.html
- Modelo base: ORG/Toz-1.5-Base (referenciado en la model card; URL exacta no disponible)
- Paper, repositorio de código y blog: no disponibles
