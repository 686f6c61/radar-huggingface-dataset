# vladimir94/dory-1.0-4b-ane-coreml

## Resumen

Dory 1.0 4B (ANE Core ML) es una conversión a Core ML con cuantización de 4 bits (palettization) del modelo NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16 de NVIDIA, publicada por el usuario vladimir94 en Hugging Face. No se trata de un fine-tuning ni de un merge: los pesos son conceptualmente los mismos del modelo original, convertidos para ejecutarse sobre el Apple Neural Engine (ANE) en ordenadores Mac con chips de la serie M.

El problema que resuelve es la ejecución local de un modelo de lenguaje con arquitectura poco convencional (transformer loopeado con gated attention) y contexto largo (24.576 tokens) en hardware Apple, donde el ecosistema habitual (CUDA, vLLM, GGUF en GPU) no aplica. La conversión divide el modelo en 102 programas Core ML que se cargan por fases, gestionados por un runtime propio construido sobre Anemll.

Es relevante porque demuestra que modelos con gated attention y residuales tipo nGPT pueden representarse fielmente en Core ML, y ofrece un punto de partida práctico para servir el modelo localmente en un Mac con una API compatible con OpenAI y una interfaz de chat incluidas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer loopeado (looped transformer) con gated attention, residual |α| tipo nGPT y RoPE NEOX |
| Parámetros totales | 4B (aproximado, según denominación del modelo base; cifra exacta no disponible) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 24.576 tokens |
| Tipos de cuantización | 4-bit palettization (esta conversión); variante fp16 disponible con `--lut-blocks none` (15 GB) |
| Idiomas soportados | Inglés (en) |
| Licencia | NVIDIA Open Model License (pesos); código del runtime bajo MIT |
| Formato de pesos | Core ML (`*.mlpackage`), 102 programas con `meta.yaml`, tablas RoPE en `rope_tables.npz` |

## Arquitectura y entrenamiento

El modelo base es un transformer loopeado de 4B parámetros con tres rasgos técnicos distintivos: gated attention (mecanismo de atención con compuertas), un esquema residual con normalización |α| heredado de la familia nGPT, y codificación posicional RoPE en variante NEOX. La conversión a Core ML representa fielmente estos tres componentes; el autor declara explícitamente que no hay destilación, poda ni reentrenamiento.

Sobre el entrenamiento del modelo original no se aportan datos en la información disponible (número de tokens, composición del dataset, RLHF/DPO): no disponible. La contribución de este repositorio es la conversión: palettization a 4 bits (quantization por tablas de búsqueda) que reduce el tamaño de 15 GB (fp16) a 5,6 GB, con una ligera pérdida de fidelidad medida mediante KLD frente al modelo de referencia fp16 (0,077–0,632 en la variante 4-bit frente a 0,019–0,056 en fp16). El runtime carga un programa a la vez según el plan de `meta.yaml`, mantiene un `MLState` por programa con estado y recompone la cabeza LM dividida.

## Capacidades

- Generación de texto conversacional en inglés: responde preguntas, escribe relatos y mantiene conversaciones multi-turno, según las mediciones del autor.
- Modo de pensamiento (thinking mode): la plantilla de chat propia del modelo (`chat_template.jinja`) incluye soporte para razonamiento extendido.
- Contexto largo: ventana de 24.576 tokens, operativa sobre el Neural Engine.
- Servido como API compatible con OpenAI mediante `dory_serve.py`, con interfaz de chat incluida.
- Ejecución totalmente local en Apple Silicon vía Apple Neural Engine, sin GPU dedicada ni nube.
- Capacidades de tool calling, agentes, código, matemáticas o visión: no disponible en la información proporcionada.

## Casos de uso

- Chatbot local en Mac: el runtime incluye un servidor con API OpenAI y UI de chat, ideal para asistentes que procesan datos sensibles sin salir del dispositivo.
- Prototipado de aplicaciones con LLM en Apple Silicon: la compatibilidad con la API de OpenAI permite integrar el modelo en clientes existentes (LangChain, SDKs oficiales) cambiando solo la URL base.
- Procesamiento de documentos largos en local: la ventana de 24.576 tokens permite resumir o analizar textos extensos sin conexión.
- Investigación sobre ejecución de modelos no convencionales en el ANE: el plan de 102 programas en `meta.yaml` y el runtime sobre Anemll son material de estudio para convertir arquitecturas exóticas (loopeadas, gated attention) a Core ML.
- Comparación de fidelidad de cuantización: las métricas KLD y de acuerdo top-1 publicadas sirven de referencia para evaluar el coste de la palettization a 4 bits frente a fp16.
- Demostraciones y pruebas en portátiles sin GPU dedicada: con 5,6 GB de pesos y ejecución en ANE, funciona en hardware Apple de consumo sin requerir GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se han publicado mediciones de rendimiento y fidelidad en un portátil de la serie M:

| Métrica | 4-bit (este repo) | fp16 |
|---|---|---|
| Decodificación, `loops=1` | 11,3 tok/s | 5,9 tok/s |
| Prefill (batch) | 130 tok/s | 130 tok/s |
| Tamaño | 5,6 GB | 15 GB |
| KLD frente al modelo fp16 de referencia | 0,077 – 0,632 | 0,019 – 0,056 |
| Acuerdo top-1 | 62,5 – 100 % | 87,5 – 100 % |

Nota del autor: la variante 4-bit es fluida y correcta en chat ordinario, pero en una ventana medida discrepó con la referencia en 3 de 8 tokens siguientes; si la fidelidad es prioritaria, conviene usar la conversión en precisión completa.

## Requisitos de hardware

- Hardware objetivo: Mac con chip de la serie M (Apple Silicon) con Apple Neural Engine. No se requieren GPU NVIDIA ni CUDA.
- Almacenamiento: 5,6 GB para la variante 4-bit; 15 GB para la variante fp16.
- Memoria de estado: cada caché de conversación ocupa 999 MiB en fp16 (no es posible una KV cache int8 en Core ML), por lo que un servidor solo mantiene unas pocas sesiones simultáneas, no cientos.
- Latencia: prefill token a token a unos 10 tok/s por defecto; conmutar a los paquetes de prefill por lotes implica una espera de 100–270 s. Decodificación a 11,3 tok/s con `loops=1` en 4-bit.
- Despliegue: runtime propio (`dory_serve.py`) construido sobre Anemll, que expone una API compatible con OpenAI y una interfaz de chat. No aplica vLLM, TGI, llama.cpp ni Ollama al ser un formato Core ML.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| Dory 1.0 4B ANE Core ML (este) | 4B | 24.576 | Core ML (mlpackage), 4-bit | NVIDIA Open Model License |
| NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16 (base) | 4B | 24.576 (según este repo) | BF16 (safetensors, presumible) | NVIDIA Open Model License |
| Alternativas comparables en ANE/Core ML | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es con su propio modelo base: esta conversión ofrece la mitad de velocidad de decodificación que... en realidad la duplica (11,3 frente a 5,9 tok/s), reduce el tamaño a un tercio (5,6 GB frente a 15 GB) a costa de una fidelidad menor (KLD 0,077–0,632 frente a 0,019–0,056). No hay datos suficientes para comparar con otros modelos de 4B de otras familias.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: inherente a todo LLM; además, la cuantización a 4 bits introduce divergencia medible respecto al modelo fp16 (acuerdo top-1 de entre 62,5 % y 100 % según la ventana), lo que puede degradar respuestas en tareas sensibles.
- Limitaciones de idioma: el modelo está etiquetado solo para inglés; no hay soporte declarado para castellano u otras lenguas.
- Limitaciones de contexto y memoria: prefill y decode no pueden estar residentes simultáneamente (204 paquetes no caben en el hardware medido); el prefill por lotes exige una conmutación de 100–270 s; la KV cache es obligatoriamente fp16 (999 MiB por sesión a 24K), lo que limita el número de sesiones concurrentes.
- Restricciones de licencia: los pesos siguen la NVIDIA Open Model License, que debe revisarse para confirmar los términos de uso comercial; el código del runtime es MIT.
- Caveat de producción: la velocidad de prefill token a token (~10 tok/s) puede ser un cuello de botella grave para prompts largos si no se acepta la conmutación de paquetes; el proyecto es una conversión de un autor individual con 1.616 descargas, sin respaldo oficial de NVIDIA para esta variante ANE.

## Enlaces

- Modelo (esta conversión): https://huggingface.co/vladimir94/dory-1.0-4b-ane-coreml
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Licencia NVIDIA Open Model License: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Runtime y scripts: https://github.com/vladimir-voinea/dory-ane
- Anemll (framework base del runtime): https://github.com/Anemll/Anemll
