# verycoololiver/Tot-360M-Family

## Resumen

Tot-360M es un modelo de lenguaje de tipo decoder-only Transformer con 345.359.296 parámetros totales (314.639.296 sin contar los embeddings), entrenado íntegramente desde inicialización aleatoria por Oliver en OB Studio. A diferencia de la mayoría de los modelos pequeños disponibles en la actualidad, que son derivados afinados de Qwen o Llama, Tot-360M emplea su propio tokenizador BPE a nivel de byte con un vocabulario de 32.000 tokens y se ha preentrenado y postentrenado de forma pública y por etapas. El proyecto está financiado por la comunidad y se ha ejecutado en instancias Kaggle Cloud TPU v5e-8 de 8 núcleos y en dos GPU NVIDIA Tesla T4.

El modelo se distribuye en formato GGUF con un diseño de tensores compatible con Qwen3, lo que permite ejecutarlo en `llama.cpp` estándar, LM Studio, PocketPal AI (iOS y Android) y ChatterUI sin parches personalizados de C++. Su ventana de contexto es de 4.096 tokens, ampliada desde los 1.024 iniciales en la cuarta ronda de entrenamiento. Con cuantizaciones de 241 MiB (Q4_K_M) y 351 MiB (Q8_0), está pensado para inferencia totalmente offline en dispositivos con recursos muy limitados: móviles con menos de 420 MB de RAM, Raspberry Pi 4 y 5, y portátiles sin GPU dedicada.

Su relevancia actual radica en que ocupa un nicho poco poblado: modelos realmente pequeños, entrenados desde cero, con licencia Apache-2.0 y empaquetado listo para consumo en hardware de gama baja. No compite en capacidad de razonamiento con modelos de miles de millones de parámetros, pero ofrece una alternativa reproducible y auditable para escenarios de IA local en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Transformer (disposición de tensores GGUF compatible con Qwen3) |
| Parametros totales | 345.359.296 (embeddings de entrada/salida atados) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (ampliado desde 1.024 en la ronda 4) |
| Tipos de cuantizacion | Q4_K_M y Q8_0 (GGUF) |
| Idiomas soportados | Inglés (en) y coreano (ko) según metadatos; el SFT v2 se orienta a inglés y código |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el recuento de parámetros) |

Otros hiperparámetros relevantes: 32 capas, `d_model` de 960, `d_ff` de 2.560 con MLP SwiGLU, 15 cabezas de consulta y 5 de clave/valor (GQA 3:1, `head_dim` de 64, QK-Norm), RoPE con `theta` de 10.000,0 y RMSNorm con `eps` de 1e-6.

## Arquitectura y entrenamiento

Tot-360M es un transformer decoder-only denso con atención de consultas agrupadas (GQA) en proporción 3:1, normalización QK-Norm, MLP SwiGLU y normalización RMSNorm. Emplea codificación posicional RoPE con theta de 10.000,0 y un tokenizador BPE a nivel de byte propio de 32.000 tokens. La disposición de tensores se ha diseñado para ser compatible con el formato GGUF de Qwen3, lo que facilita su carga en herramientas estándar.

El entrenamiento se documenta en cinco rondas más una fase de ajuste supervisado (SFT), con un total acumulado de aproximadamente 1.865 millones de tokens procesados. La ronda 1 procesó 405,7 millones de tokens con pérdida descendiendo de 4,74 a 2,73; la ronda 3 alcanzó 1.430 millones de tokens con pérdida de 2,61 a 2,03; la ronda 4 expandió el contexto de 1.024 a 4.096 tokens y redujo la pérdida de 1,39 a 1,24; la ronda 5 (base 4K) llegó a 1.799 millones de tokens con pérdida de 1,38 a 1,14. La fase SFT v2, orientada a inglés y código, se ejecutó entre los pasos 109.958 y 113.958, con pérdida enmascarada de 2,64 a 1,14. El cómputo se realizó en TPU v5e-8 de Kaggle y en dos Tesla T4. No se documentan en la información disponible detalles sobre RLHF o DPO, ni la composición exacta del dataset de preentrenamiento más allá de la orientación a inglés y código en la fase SFT.

## Capacidades

- Generación de texto autoregresiva en inglés y coreano (este último según los metadatos del modelo; el SFT v2 prioriza inglés y código).
- Generación de código en la fase SFT v2, con ejemplos de funciones Python en la model card.
- Conversación multi-turno mediante la plantilla de chat ChatML (`<|im_start|>` / `<|im_end|>`), compatible con `llama.cpp` y frontends estándar.
- Inferencia 100 % offline en dispositivos móviles y de placa única.
- Compatibilidad con endpoints y herramientas que consumen GGUF estándar (LM Studio, PocketPal AI, ChatterUI, `llama.cpp`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento en la información disponible.

## Casos de uso

- Asistente de chat offline en móvil: con Q4_K_M (241 MiB) y menos de 420 MB de RAM, el modelo puede mantener conversaciones multi-turno de hasta 4.096 tokens en PocketPal AI o ChatterUI en modo avión, sin conexión ni servidores externos.
- Autocompletado y generación de código en el editor: la fase SFT v2 orientada a inglés y código permite integrar el modelo en plugins locales de editores para sugerencias de funciones cortas, con latencia aceptable en CPU (más de 35 tok/s según el autor).
- Procesamiento de texto en Raspberry Pi 4/5: despliegue en domótica o dispositivos de borde para tareas de resumen, clasificación o respuesta a comandos en lenguaje natural, sin GPU y con consumo mínimo de memoria.
- Prototipado educativo y de investigación: al estar entrenado desde cero y con registro público de rondas, sirve para estudiar curvas de pérdida, expansión de contexto y efectos del SFT en modelos pequeños.
- Filtrado y etiquetado local de texto: clasificación de correos, mensajes o reseñas en inglés dentro de pipelines que requieren privacidad y no pueden enviar datos a la nube.
- Generación de respuestas en asistentes integrados en aplicaciones de escritorio: el proyecto ofrece un compañero de escritorio para Windows (Tot Desktop AI Companion) que aprovecha el modelo para interacción local.
- Pruebas de integración de GGUF en CI: al ser un modelo de 241 MiB, es adecuado para validar pipelines de `llama.cpp`, LM Studio o servidores compatibles sin coste de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta curvas de pérdida por ronda de entrenamiento (de 4,74 a 1,14 en la fase SFT) y una velocidad aproximada de más de 35 tok/s en CPU, sin comparaciones estandarizadas tipo MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; en Q4_K_M ocupa 241 MiB en disco y el autor indica que se ejecuta con menos de 420 MB de RAM en móvil. En Q8_0 ocupa 351 MiB.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU. Cualquier GPU con más de 1 GB de VRAM puede alojarlo, pero no se documentan configuraciones óptimas.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (RTX 3060, RTX 4090, etc.), aunque su diseño objetivo es CPU y móvil.
- Opciones de despliegue: `llama.cpp`, LM Studio, PocketPal AI (iOS y Android), ChatterUI y cualquier runtime compatible con GGUF estándar. No se documenta soporte de vLLM ni TGI en la información disponible.
- Latencia y throughput: el autor reporta más de 35 tok/s en CPU en portátiles convencionales; no se ofrecen cifras desglosadas por hardware ni para GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Tot-360M | 345 M | 4.096 | Apache-2.0 | GGUF | Hugging Face, web del proyecto |
| Qwen2.5-0.5B | 494 M | 32.768 | Apache-2.0 | safetensors, GGUF | Hugging Face, ecosistema amplio |
| SmolLM2-360M | 362 M | 8.192 | Apache-2.0 | safetensors, GGUF | Hugging Face |
| TinyLlama-1.1B | 1,1 B | 2.048 | Apache-2.0 | safetensors, GGUF | Hugging Face |

La comparación se limita a parámetros, contexto, licencia y disponibilidad, ya que no hay benchmarks publicados de Tot-360M que permitan contrastar rendimiento. Frente a Qwen2.5-0.5B y SmolLM2-360M, Tot-360M ofrece un contexto menor (4.096 frente a 32.768 y 8.192 respectivamente) y un ecosistema más reducido, pero su ventaja diferencial es el entrenamiento desde cero y el empaquetado específico para dispositivos de gama muy baja. TinyLlama-1.1B, con más parámetros, también parte de entrenamiento desde cero, pero su contexto es menor.

## Limitaciones y advertencias

- Modelo de 345 M de parámetros: la capacidad de razonamiento, matemáticas y conocimiento factual es limitada en comparación con modelos de miles de millones de parámetros; no es adecuado para tareas que exijan precisión factual alta.
- Riesgo elevado de alucinación, especialmente en dominios especializados y en preguntas abiertas.
- Ventana de contexto de solo 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Idiomas: los metadatos declaran inglés y coreano, pero la fase SFT v2 se orienta a inglés y código; el rendimiento en coreano y en castellano no está documentado y probablemente sea bajo.
- No se documentan mecanismos de tool calling, agentes ni razonamiento multi-paso, lo que limita su uso en pipelines automatizados complejos.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene auditar el modelo antes de integrarlo en producción.
- El proyecto es comunitario y de un solo autor; la continuidad, el mantenimiento y las actualizaciones no están garantizados.
- No hay benchmarks estandarizados publicados, por lo que la evaluación de calidad debe hacerse de forma empírica en el caso de uso concreto.

## Enlaces

- Hugging Face: https://huggingface.co/verycoololiver/Tot-360M-Family
- Web del proyecto (OB Studio): https://obstudio.org/
- Demostración en vivo en Raspberry Pi 4: https://obstudio.org/tot-360m/demo/
- Especificación técnica y curva de pérdida: https://obstudio.org/tot-360m/
- Tot Desktop AI Companion para Windows: https://obstudio.org/tools/tot/
- Drift, navegador de IA centrado en privacidad: https://obstudio.org/tools/drift/
- Guía para ejecutar el modelo en móvil, portátil o Raspberry Pi 4: https://obstudio.org/blog/free-local-ai-for-phone-raspberry-pi-gguf/
- Nota sobre SFT v2 en Raspberry Pi 4: https://obstudio.org/blog/tot-360m-sft-v2-live-raspberry-pi-demo/
- Nota sobre la expansión a contexto 4K: https://obstudio.org/blog/tot-360m-first-post-trained-4k-checkpoint/
- Nota sobre la ronda 2 de entrenamiento: https://obstudio.org/blog/2nd-training-run-done/
- Descarga directa Q4_K_M ronda 5: https://obstudio.org/downloads/tot_360m_run5_4k_q4_k_m.gguf
- Descarga directa Q8_0 ronda 5: https://obstudio.org/downloads/tot_360m_run5_4k_q8_0.gguf
