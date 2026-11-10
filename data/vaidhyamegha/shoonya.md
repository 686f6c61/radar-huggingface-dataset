# VaidhyaMegha/Shoonya

## Resumen

Shoonya v0.4.0 es un modelo de lenguaje autorregresivo de tipo investigacion, desarrollado por el usuario VaidhyaMegha, especializado en generacion de codigo Python y Rust. Combina una arquitectura transformer con Pre-RMSNorm, Grouped-Query Attention (GQA), SwiGLU y RoPE/NTK/YaRN, junto con componentes de tipo SparseMoE y Mamba, todo ello acompanado de un motor de sistemas escrito en Rust compuesto por cinco crates (`shoonya-core`, `shoonya-telemetry`, `shoonya-eval`, `shoonya-ffi`, `shoonya-cli`). El checkpoint publicado es de tamano muy reducido: 16.805.376 parametros, con 4 capas, hidden size de 256 y 4 cabezas de atencion (2 cabezas KV).

El modelo aborda el problema de la generacion de codigo fiable en entornos de ejecucion controlados, incorporando un tokenizador especifico para codigo (`CodeTokenizer`, vocab_size 50.264) que extiende el BPE de GPT-2 con tokens de control FIM y tokens atomicos de indentacion Python, lo que reduce la longitud de las secuencias de funciones Python en un 37,9% y elimina los errores de indentacion en las pruebas realizadas. Ademas, integra telemetria mecanicista en Rust para monitorizar la regularizacion espectral durante el entrenamiento.

Su relevancia actual reside en su enfoque de evaluacion guiada por ejecucion (execution-guided evaluation) y en la combinacion de tecnicas de arquitectura y tooling en un modelo de investigacion de bajo coste computacional. La licencia es MIT y esta orientado a generacion de texto y codigo en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo con Pre-RMSNorm, GQA, SwiGLU, RoPE/NTK/YaRN, hibrido SparseMoE/Mamba |
| Parametros totales | 16.805.376 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 simetrica y INT4 asimetrica para KV-cache; pesos en PyTorch y ONNX |
| Idiomas soportados | en, code |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt), ONNX |

## Arquitectura y entrenamiento

La arquitectura se basa en un transformer autorregenerativo con Pre-RMSNorm en el flujo residual, bloques feed-forward SwiGLU y atencion multi-cabeza con Grouped-Query Attention (4 cabezas de atencion, 2 cabezas KV). Incorpora atencion causal estricta con fast-path SDPA (`is_causal=True`) y Sliding Window Attention causal solo por la izquierda. El posicionamiento usa RoPE por cabeza con forma `[1, 1, seq_len, head_dim]`, con soporte para escalado NTK-aware, YaRN y ALiBi. La configuracion incluye `hidden_size=256`, `num_hidden_layers=4`, `intermediate_size=1024` y `vocab_size=50264`. El modelo se presenta como hibrido con componentes SparseMoE y Mamba, aunque no se detalla en la informacion disponible como se integran estos componentes en el checkpoint publicado.

El entrenamiento incorpora un tokenizador especifico de codigo que extiende el BPE de GPT-2 con tokens de control disjuntos (`<|pad|>`, `<|fim_prefix|>`, `<|fim_suffix|>`, `<|fim_middle|>`) y tokens atomicos de indentacion Python (`<|indent_4|>`, `<|indent_8|>`, `<|indent_12|>`). El motor en Rust incluye un empaquetador de secuencias FFD (Best-Fit Decreasing) y transformaciones Fill-in-the-Middle (PSM/SPM). Tambien se aplica una penalizacion de repeticion CTRL con reconocimiento de scope que exime los tokens de firma del prompt, y una regularizacion espectral en bucle cerrado mediante SVD en vivo del exponente de ley de potencias HTSR y el rango efectivo Roy-Vetterli, ajustando dinamicamente el weight decay de AdamW para mantener alfa en [1.85, 2.5]. No se dispone de informacion sobre el volumen de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Generacion de texto autorregresiva en ingles y codigo.
- Generacion de codigo Python y Rust, con soporte de Fill-in-the-Middle (FIM) mediante tokens de prefijo, sufijo y medio.
- Manejo de indentacion Python mediante tokens atomicos, eliminando errores de indentacion en las pruebas del autor.
- Evaluacion guiada por ejecucion en sandbox Rust paralelo, ejecutando funciones Python y Rust (`rustc`) contra aserciones de tests unitarios.
- Analisis estatico de codigo: complejidad ciclomatica AST, volumen de Halstead y descomposicion de sorpresa por rol de token AST.
- Telemetria mecanicista: monitorizacion de SVD, exponente HTSR y rango efectivo durante el entrenamiento.
- Muestreo vectorizado Top-K/Top-P/Min-P en Rust con penalizacion de repeticion con reconocimiento de scope.
- No se dispone de informacion sobre tool calling, function calling, soporte de agentes, vision, audio ni modo thinking.

## Casos de uso

- Generacion de funciones Python en pipelines de evaluacion automatizada: el modelo puede generar cuerpos de funcion a partir de firmas y validarse contra tests unitarios en el sandbox `shoonya-eval`, lo que permite filtrar candidatos por ejecucion real antes de integrarlos.
- Relleno de codigo en editores (FIM): gracias a los tokens `<|fim_prefix|>`, `<|fim_suffix|>` y `<|fim_middle|>`, puede usarse para completar fragmentos de codigo entre contexto previo y posterior, un caso tipico en asistentes de autocompletado.
- Generacion de codigo Rust con validacion por compilador: el sandbox invoca `rustc` para compilar las funciones generadas y ejecutar aserciones, lo que permite usar el modelo en tareas de sintesis de codigo con verificacion de compilacion.
- Investigacion en tokenizacion de codigo: el `CodeTokenizer` con tokens atomicos de indentacion sirve como base para experimentos sobre compresion de secuencias y reduccion de errores sintacticos en modelos pequenos.
- Prototipado de tecnicas de regularizacion espectral: el bucle cerrado de SVD y ajuste de weight decay puede reutilizarse en experimentos de entrenamiento de modelos pequenos con monitorizacion HTSR.
- Evaluacion comparativa de modelos de codigo de bajo coste: al ser un checkpoint de 16,8 M de parametros con licencia MIT, es adecuado para experimentos academicos y pruebas de concepto en entornos con recursos limitados.
- Analisis estatico asistido: la descomposicion de sorpresa por rol de token AST y las metricas de Halstead y complejidad ciclomatica pueden emplearse para estudiar la calidad del codigo generado en corpus de investigacion.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| pass@1 medio (sandbox guiado por ejecucion) | 65,62% |
| pass@2 medio (sandbox guiado por ejecucion) | 79,17% |
| pass^2 medio (fiabilidad multi-intento) | 55,47% |
| `binary_search` pass@1 / pass@2 | 75,0% / 100,0% |
| Identificador AST renombrado no visto (`locate_in_sorted` pass@1) | 100,0% |
| Tasa de `IndentationError` | 0,0% (0 / 32) |
| HTSR espectral alfa / ratio de rango efectivo | 1,87 / 75,1% |
| Puntuacion Pareto normalizada por computo | 230,9 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el checkpoint de 16,8 M de parametros; el repo ocupa 0,4 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 1-2 GB de VRAM (por ejemplo GTX 1650, RTX 3050, RTX 4090) e incluso en CPU.
- Opciones de despliegue: inferencia directa con PyTorch y `transformers` (el ejemplo de la model card usa `GPT2Tokenizer` y clases locales `TransformerLM`/`ModelConfig`); exportacion a ONNX disponible segun los tags del repo; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shoonya v0.4.0 | 16,8 M | no disponible | Codigo Python/Rust con telemetria Rust | MIT | Hugging Face |
| Modelos de codigo de talla similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El checkpoint publicado es de 16,8 M de parametros, un tamano muy reducido que limita severamente la calidad y generalidad del codigo generado frente a modelos de mayor escala.
- Los benchmarks son declarados por el autor y no estan verificados de forma independiente (`verified: false`); deben interpretarse con cautela.
- El conjunto de evaluacion es propio del autor ("Shoonya Execution-Guided Python & Rust Suite"), lo que impide comparaciones directas con suites estandar como HumanEval o MBPP.
- Idiomas limitados a ingles y codigo; no se garantiza buen rendimiento en otros idiomas naturales.
- No se dispone de informacion sobre longitud de contexto soportada, sesgos conocidos ni tasas de alucinacion.
- La licencia MIT permite uso comercial, pero al tratarse de un modelo de investigacion de muy bajo tamano no se recomienda para produccion sin validacion exhaustiva.
- La documentacion no detalla la composicion del dataset de entrenamiento ni el volumen de tokens, lo que dificulta evaluar la cobertura y posibles sesgos.
- El modelo depende de codigo local (`model.transformer`, `data.code_dataset`) no publicado como paquete estandar, lo que complica su integracion directa en pipelines convencionales.

## Enlaces

- Hugging Face: https://huggingface.co/VaidhyaMegha/Shoonya
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
