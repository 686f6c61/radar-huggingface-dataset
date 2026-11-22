# theatechcorporation/amaara-code-20b-GGUF

## Resumen

Amaara Code 20B (GGUF) es una exportación en formato GGUF de un adaptador LoRA de ajuste supervisado (SFT) entrenado sobre el modelo base `openai/gpt-oss-20b`, un transformer de arquitectura mixture-of-experts (MoE) con 20.914.757.184 parámetros totales y aproximadamente 3.600 millones activos por token. Lo desarrolla theatechcorporation y está orientado a codificación agéntica: el modelo emite llamadas a herramientas en formato harmony (canales `analysis`, `commentary` y `final`), con un corpus de entrenamiento compuesto mayoritariamente por trazas reales de agentes.

El problema que aborda es la escasez de modelos abiertos específicamente ajustados para flujos agénticos de codificación sobre trazas operativas reales. La ronda 1 se entrenó sobre 98.391 trazas armonizadas (176.689 mensajes y 96.204 llamadas a herramientas procedentes de 2.083 ejecuciones reales de agentes), con un 82% de llamadas a la herramienta `bash`.

Es relevante ahora por su tamaño manejable y su eficiencia: la cuantización MXFP4_MOE ocupa 11,3 GB y cabe con holgura en una GPU de 16 GB, lo que permite ejecutar localmente un modelo MoE de 20B con llamadas a herramientas. El autor declara explícitamente que el modelo **no ha sido evaluado todavía** en capacidad agéntica y que no existe ninguna cifra de benchmark medida; la model card indica que se publicará o se retirará la afirmación cuando se ejecute la evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE), pesos nativos MXFP4, formato harmony |
| Parámetros totales | 20.914.757.184 (≈20,9B) |
| Parámetros activos | ≈3,6B |
| Longitud de contexto | 32.768 tokens (configuración de ejemplo en `llama-server -c 32768`); máximo nativo no disponible |
| Tipos de cuantización | MXFP4_MOE (72 tensores MXFP4 + 98 Q8_0 + 289 F32), Q4_K_M (121 Q5_0 + 25 Q8_0 + 24 Q4_K + 289 F32) |
| Idiomas soportados | en (inglés) |
| Licencia | A-Tech Model License v1.0 (comercial gratuito e ilimitado por debajo de 10 M USD de ingresos anuales; por encima requiere licencia enterprise). Base derivada de `openai/gpt-oss-20b` |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con pesos nativos MXFP4 y 20,9B parámetros totales, de los cuales unos 3,6B se activan por token. El ajuste de la ronda 1 es un LoRA SFT con r=16, α=16 y 402 módulos objetivo, entrenado durante 1.200 pasos con longitud de secuencia de 8.192 tokens, learning rate 2e-4 con decaimiento coseno, sobre una RTX 4090 en 2 horas y 42 minutos. El adaptador resultante pesa 740.115.376 bytes y contiene 3.264 tensores. La pérdida final de entrenamiento fue 4,626, con trayectoria 6,80 → 5,40 → 4,95 → 4,55 → 4,46; el autor advierte que la pérdida es un objetivo de entrenamiento, no una medida de capacidad, y que un valor absoluto de ~4,6 es esperable con este tokenizador.

El corpus de entrenamiento son 98.391 trazas armonizadas de agentes (176.689 mensajes, 96.204 llamadas a herramientas, 2.083 ejecuciones heartbeat reales), complementadas con datos de instrucción y razonamiento; el 82% de las llamadas son a `bash`, lo que refleja el entorno del que proceden las trazas. Antes del entrenamiento se generalizaron las trazas: se sustituyeron 6 marcas de clientes, 5 personas, 12 slugs de proyecto y rutas locales, y se verificó la ausencia de 25 patrones prohibidos. No se menciona RLHF ni DPO en la información disponible.

En cuanto a la cuantización, `llama-quantize` deja 289 de 459 tensores en F32 (normas, router y tensores pequeños), por lo que los ficheros son mayores de lo que sugiere el nombre de la cuantización y Q6_K resulta del mismo tamaño que Q8_0. El tipo correcto en `llama-quantize` es `MXFP4_MOE` (tipo 38); `MXFP4` simple se rechaza con `invalid ftype`, y `convert_hf_to_gguf.py` no puede emitirlo, de modo que la única vía es F16 GGUF → `llama-quantize MXFP4_MOE`.

## Capacidades

- Generación de texto y razonamiento en inglés, con canales separados de análisis (`analysis`), comentario (`commentary`) y respuesta final (`final`).
- Codificación agéntica: emite llamadas a herramientas armonizadas en el canal `commentary` con el formato `<|start|>assistant to=functions.NAME<|channel|>commentary json<|message|>{args}<|call|>`.
- Soporte de tool calling / function calling, limitado a **una llamada por mensaje** según la plantilla.
- Ejecución de comandos de shell mediante la herramienta `bash`, que domina el corpus de entrenamiento (82%).
- Razonamiento multi-paso dentro de un mismo turno, con trazas de instrucción y razonamiento incluidas en el entrenamiento.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.
- No dispone de visión ni audio según la información proporcionada.

## Casos de uso

- Automatización de tareas de shell en pipelines: el modelo emite llamadas `bash` estructuradas que un orquestador puede ejecutar y devolver como observación, encajando con el 82% de trazas de shell de su entrenamiento.
- Asistente de codificación local con herramientas: integrado en `llama-server` con `--jinja`, permite que un agente externo reciba llamadas a funciones y las despache, con contexto de 32.768 tokens.
- Prototipado de agentes en estación de trabajo: la cuantización MXFP4_MOE de 11,3 GB cabe en una GPU de 16 GB con ~5 GB de margen, lo que permite iterar sin infraestructura de servidor.
- Investigación sobre trazas agénticas: al derivar de ejecuciones heartbeat reales y publicarse con detalle de entrenamiento, sirve como punto de partida reproducible para estudiar SFT sobre trazas armonizadas.
- Despliegue en CPU para tareas por lotes: el autor mide 6,0 tok/s con MXFP4_MOE y 3,2 tok/s con Q4_K_M en 40-48 hilos, suficiente para procesos no interactivos.
- Evaluación comparativa de formatos de cuantización: al incluir MXFP4_MOE y Q4_K_M del mismo adaptador, permite medir el delta de calidad entre formatos antes de asumir que es lossless.
- Generación de comandos de administración de sistemas en inglés: útil en entornos donde el operador trabaja en inglés y necesita traducción de intención a comandos de shell.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que el modelo **no ha sido evaluado** para capacidad agéntica y que no existe ninguna cifra de benchmark medida de codificación o agentes. Las únicas medidas publicadas son de entrenamiento e inferencia:

| Métrica | Valor |
|---|---|
| Pérdida final de entrenamiento | 4,626 (trayectoria 6,80 → 5,40 → 4,95 → 4,55 → 4,46) |
| Pasos de entrenamiento | 1.200 |
| Tiempo de entrenamiento | 2 h 42 min en RTX 4090 |
| Throughput CPU, MXFP4_MOE | 6,0 tok/s (40-48 hilos) |
| Throughput CPU, Q4_K_M | 3,2 tok/s (40-48 hilos) |

## Requisitos de hardware

- VRAM estimada: 11,3 GB para `amaara-code-20b-r1-MXFP4_MOE.gguf` (cabe en 16 GB con ~5 GB de margen); 14,7 GB para `amaara-code-20b-r1-Q4_K_M.gguf` (marginal en 16 GB, ~1,6 GB de margen).
- GPU recomendadas: RTX 4090 (entrenamiento del adaptador y inferencia), cualquier GPU de 16 GB o más para MXFP4_MOE; A100/H100 para servicio concurrente.
- Cabe en GPU de consumo: sí, en modelos de 16 GB o superiores con el fichero MXFP4_MOE; el Q4_K_M queda al límite.
- Opciones de despliegue: llama.cpp (`llama-server` con `-ngl 99 -c 32768 --jinja -ub 512 -b 1024`); el tag `endpoints_compatible` sugiere compatibilidad con endpoints, sin detalle adicional disponible. vLLM, Ollama y TGI no se mencionan en la información.
- Latencia y throughput: solo medidas en CPU (6,0 tok/s MXFP4_MOE, 3,2 tok/s Q4_K_M en 40-48 hilos); no hay cifras de GPU.
- Disco: la conversión F16 → MXFP4_MOE requiere ~2x el tamaño del modelo en espacio libre.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Evaluación publicada |
|---|---|---|---|---|---|---|
| Amaara Code 20B r1 | 20,9B | ≈3,6B | 32.768 (config. de ejemplo) | A-Tech Model License v1.0 | GGUF | Ninguna; declarada como no evaluada |
| openai/gpt-oss-20b (base) | 20,9B | ≈3,6B | no disponible | no disponible | safetensors (MXFP4 nativo) | no disponible |
| Alternativas de codificación agéntica de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación con datos verificables es frente al modelo base: Amaara Code 20B r1 es un LoRA SFT sobre `openai/gpt-oss-20b`, conserva su arquitectura MoE y sus pesos nativos MXFP4, y difiere en el ajuste sobre trazas agénticas y en la licencia propia del derivado. No se dispone de datos de otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- **Sin evaluación**: la model card declara que el modelo no ha sido evaluado para capacidad agéntica y que no debe describirse como si tuviera cifras de benchmark. Cualquier afirmación de capacidad debe tratarse como no verificada.
- **Desajuste de herramientas observado**: en una prueba de humo, al pedirle listar un directorio el modelo recurre a una herramienta `list_dir`, mientras que el harness de evaluación solo expone `bash`.
- **Verificación escasa**: solo el 3,4% del corpus demuestra verificación después de editar un fichero; la ronda 2 se dirige a este hueco.
- **Idioma**: solo inglés; no hay soporte multilingüe declarado.
- **Formato de decodificación**: usar `skip_special_tokens=True` por sí solo produce salidas corruptas como `finalREADY`; es obligatorio parsear los marcadores de canal harmony.
- **Una llamada por mensaje**: la plantilla permite una única llamada a herramienta por mensaje, lo que limita el paralelismo de acciones.
- **Cuantización no trivial**: 289 tensores quedan en F32, Q6_K ocupa lo mismo que Q8_0, y el delta de calidad de MXFP4_MOE debe medirse antes de asumirlo lossless.
- **Licencia**: uso comercial gratuito solo por debajo de 10 M USD de ingresos anuales agregados del grupo; por encima se requiere licencia enterprise. Verificar también las condiciones del modelo base `openai/gpt-oss-20b`.
- **Riesgo de alucinación**: no se documenta ninguna mitigación específica; al ser un SFT sobre trazas de agentes, puede generar llamadas a herramientas inexistentes en el entorno de destino.
- **Estado provisional**: la publicación corresponde a la ronda 1 y la model card indica que se actualizará o retirará la afirmación de capacidad agéntica tras la evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/theatechcorporation/amaara-code-20b-GGUF
- Licencia A-Tech Model License v1.0: https://huggingface.co/theatechcorporation/amaara-code-20b-GGUF/blob/main/LICENSE
- Licencia enterprise: https://theatechcorporation.com/enterprise
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Comunidad AI Owner's Club: https://www.skool.com/open-source-ai-builders-club/about
