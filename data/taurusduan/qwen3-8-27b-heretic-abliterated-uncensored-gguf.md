# taurusduan/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF

## Resumen

El modelo `taurusduan/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF` es una variante abliterada (sin rechazos) del modelo Qwen3.8-27B de Qwen, publicada en formato GGUF para inferencia local con llama.cpp. El autor, taurusduan, parte del trabajo de Tim Rohrbaugh (`trohrbaugh/Qwen3.8-27B-heretic-ara`) y aplica dos pasadas adicionales de ARA (Arbitrary-Rank Ablation) para reducir los rechazos de 3/100 a 0-1/100, manteniendo un KL de aproximadamente 0.0085. El resultado es un modelo de 27B parámetros que conserva las capacidades del base pero con guardarraíles de seguridad reducidos de forma deliberada.

La arquitectura es híbrida: combina atención estándar con capas de atención lineal Gated DeltaNet (48 de 64 capas), lo que permite una ventana de contexto de 262.144 tokens. El modelo está pensado para investigación, escritura creativa, roleplay y generación de texto sin censura para adultos, y se distribuye bajo licencia Apache-2.0. El repositorio incluye tanto el cuantizado legacy Q4_K_M como 53 archivos GGUF RVN, algunos con el cabezal MTP para decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5_text` (Qwen3.8), híbrida: 16 capas de atención estándar + 48 capas Gated DeltaNet (atención lineal) |
| Parametros totales | 27.000.000.000 (26.895.936.464 según safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | GGUF con múltiples cuantizaciones: legacy Q4_K_M y archivos RVN (F16 y varias tieras Q, no se detalla la lista exacta) |
| Idiomas soportados | multilingüe (no se especifican idiomas concretos; el base Qwen3.8 es multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.8-27B es híbrida: combina 16 capas de atención completa (GQA con 24 cabezas y 4 cabezas KV, head_dim 256) con 48 capas de atención lineal Gated DeltaNet, lo que permite una ventana de contexto de 262.144 tokens con un coste de memoria y cómputo reducido en contextos largos. El vocabulario es de 248.320 tokens.

El proceso de abliteración usa ARA (Arbitrary-Rank Ablation), implementado en la herramienta heretic. En lugar de restar una única dirección de rechazo como en la abliteración tradicional, ARA trata el problema como una optimización de matrices: para cada módulo objetivo (proyección de salida de atención y proyección de salida de MLP), se recogen activaciones en prompts "buenos" (solicitudes inofensivas) y "malos" (solicitudes dañinas), y se usa un optimizador LBFGS para reescribir la matriz de pesos de modo que se preserven las salidas en prompts buenos (KL bajo), se acerquen las salidas de prompts malos al manifold de salidas buenas (k-NN) y se sobredirijan las salidas de prompts malos lejos de las originales. Este método de "rango arbitrario" puede eliminar circuitos de rechazo complejos con menos daño conductual que la resta direccional simple.

En este modelo RVN, el proceso se aplica tres veces: primero por Rohrbaugh (de base Qwen3.8-27B a `-ara`, con KL 0.0535 y 3 rechazos/100), y luego dos pasadas ARA adicionales de peso completo por parte de taurusduan sobre el resultado (mismos parámetros: start 26, end 56, preserve 0.9432, steer 0.0009, overcorrect 0.5038, neighbor 10), alcanzando KL 0.0085 y rechazos 0-1/100. El modelo mantiene el template de chat oficial de Qwen3.8 y soporta tool-calling y control del modo de pensamiento.

## Capacidades

- Generación de texto conversacional y de larga forma, con contexto de hasta 262K tokens.
- Razonamiento multistep y modo "thinking" (pensamiento) controlable, heredado del base Qwen3.8.
- Capacidades multilingües (el base es multilingüe, aunque no se detallan idiomas).
- Soporte de tool calling / function calling (compatible con OpenAI, según la card del modelo).
- Generación de código y matemáticas, como el modelo base.
- Escritura creativa y roleplay sin filtros de contenido (por diseño, al estar abliterado).
- Decodificación especulativa mediante MTP (Multi-Token Prediction) en los archivos `*-mtp.gguf`.

## Casos de uso

- **Investigación sobre alineación y seguridad**: permite estudiar los mecanismos internos de rechazo y cómo eliminarlos, útil para investigadores que analizan comportamientos de modelos de lenguaje.
- **Escritura creativa sin restricciones**: adecuado para autores que necesitan explorar temas sensibles o tabú en ficción, con contexto largo para mantener tramas extensas.
- **Roleplay en comunidad**: la ausencia de rechazos y el soporte de tool calling permiten construir personajes y escenarios sin interrupciones del sistema.
- **Análisis de contenido en contextos largos**: gracias a su ventana de 262K tokens, puede resumir o analizar documentos extensos (informes, libros, transcripciones) sin perder el hilo.
- **Prototipado de agentes conversacionales**: su compatibilidad con el template oficial de Qwen3.8 y OpenAI-compatible tool-calling facilita la integración en frameworks de agentes (p. ej. vLLM, Ollama) para pruebas locales.
- **Generación de código en entornos sin conexión**: el modelo conserva las capacidades de programación del base, y al ser GGUF puede ejecutarse en hardware local para entornos aislados o de baja conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta métricas de abliteración: KL ≈ 0.0085 respecto al base y tasa de rechazo de 0-1/100 en prompts dañinos, pero no hay datos de rendimiento comparativo en tareas estándar.

## Requisitos de hardware

- **VRAM estimada**: para un modelo de 27B en GGUF, se estima:
  - Q4_K_M: ~16-17 GB VRAM (incluye contexto moderado).
  - Q6_K: ~20-21 GB VRAM.
  - Q8_0: ~27-28 GB VRAM.
  - F16: ~54 GB VRAM (no apto para consumer).
- **GPU recomendadas**: para cuantizaciones bajas (Q4_K_M) puede ejecutarse en una RTX 4090 (24 GB) o RTX 3090 (24 GB). Para Q6_K se requiere una GPU con 24 GB o más (A100 40GB, RTX 4090). Para F16, se necesitan GPUs de datacenter (A100 80GB, H100).
- **Compatibilidad con consumer GPU**: sí, en cuantizaciones Q4_K_M o inferiores con 24 GB de VRAM; también se puede usar CPU con llama.cpp aunque con latencia mayor.
- **Opciones de despliegue**: llama.cpp, Ollama, vLLM (con soporte GGUF), text-generation-inference (TGI) si se convierte a safetensors, y cualquier backend compatible con GGUF.
- **Latencia y throughput**: no se dispone de datos medidos. Para 27B en Q4_K_M en una RTX 4090 se espera un throughput de ~20-40 tokens/s en generación, pero depende del contexto y del backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Híbrida (Gated DeltaNet + atención estándar) | Apache-2.0 | Safetensors, GGUF | Modelo original con guardrails de seguridad |
| taurusduan/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF | 27B | 262K | Híbrida (Gated DeltaNet + atención estándar) | Apache-2.0 | GGUF | Abliterado con ARA doble pasada, sin rechazos |
| huihui-ai/Qwen3-8B-abliterated | 8B | 128K (aprox.) | Transformer estándar (Qwen3-8B) | Apache-2.0 | Safetensors, GGUF | Abliterado de Qwen3-8B, menor tamaño y contexto |

Nota: no se dispone de datos de rendimiento comparativos (benchmarks) entre estos modelos; la comparación es estructural.

## Limitaciones y advertencias

- **Ausencia de guardrails de seguridad**: el modelo está deliberadamente abliterado y puede generar contenido dañino, ilegal o no ético si se le solicita. No debe usarse en producción sin un sistema de filtrado adicional.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede producir información falsa o inventada, especialmente en contextos largos o temas especializados.
- **Sesgos heredados**: el modelo base Qwen3.8 puede tener sesgos culturales, de género o ideológicos; la abliteración no los elimina, solo elimina los rechazos.
- **Restricciones de licencia**: aunque la licencia es Apache-2.0 (permite uso comercial), el uso del modelo para generar contenido dañino puede violar leyes locales. La card indica "para adultos (18+) y uso responsable".
- **Compatibilidad**: los archivos legacy (Q4_K_M) son de una versión anterior de la abliteración; se recomienda usar los archivos RVN y los `*-mtp.gguf` para nuevas implementaciones.
- **Soporte de tool calling**: la card indica que el template oficial de Qwen3.8 está embebido, pero se recomienda verificar la compatibilidad con cada backend (vLLM, Ollama) antes de desplegar.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/taurusduan/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fuente de la abliteración ARA: https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Herramienta heretic (GitHub): https://github.com/p-e-w/heretic
- Repositorio oficial de Qwen3.8 (GitHub): https://github.com/QwenLM/Qwen3.8
- Artículo sobre el modelo abliterado GGUF (blog orcarouter): https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Artículo sobre la variante FP8 (misma abliteración, formato FP8): https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-fp8
