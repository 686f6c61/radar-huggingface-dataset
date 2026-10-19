# xtools-at/Qwen3.5-2B-Qwensploit-CyberSecurity

## Resumen

Qwensploit 3.5 2B es un ajuste fino (fine-tune) especializado en ciberseguridad del modelo `xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic`, un merge de la familia Qwen3.5-2B que combina destilaciones de razonamiento, código y razonamiento multi-paso. Lo desarrolla el usuario xtools-at y está orientado a razonamiento sobre seguridad, análisis de vulnerabilidades, revisión de código seguro, conocimiento de red team y respuesta a preguntas técnicas.

El modelo parte de una base de aproximadamente 2.213 millones de parámetros (2,21 B) y se ha entrenado con supervisión (SFT) mediante LoRA sobre 7.000 ejemplos procedentes de cuatro conjuntos de datos: dos de temática específica de ciberseguridad y red team, y dos de destilación sintética de razonamiento y código. El entrenamiento se realizó a una longitud de contexto de 8.192 tokens, con 1 epoch, LoRA de rango 16 sobre todos los módulos lineales y una única GPU NVIDIA L4 de 24 GB.

Su relevancia es acotada pero clara: ofrece un modelo pequeño (~2 B), con licencia declarada Apache-2.0 y ejecutable en hardware de consumo, orientado a un nicho (seguridad ofensiva y defensiva autorizada, CTF, análisis de amenazas) donde la mayoría de modelos generalistas aplican rechazos o filtros que dificultan el trabajo técnico. El autor declara explícitamente que no hay evaluación independiente de rendimiento en tareas reales de seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), ajuste fino LoRA sobre un modelo merge |
| Parámetros totales | 2.213.241.664 (~2,21 B) |
| Parámetros activos | no aplica (no se describe como MoE en la información disponible) |
| Longitud de contexto | 8.192 tokens (longitud usada en el entrenamiento); contexto nativo del modelo base: no disponible |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos safetensors) |
| Idiomas soportados | inglés (`en`); otros idiomas no declarados |
| Licencia | Apache-2.0 (sujeta a revisión de compatibilidad con licencias upstream) |
| Formato de pesos | safetensors (librería transformers); tamaño del repo 4,4 GB |
| Pipeline declarado | image-text-to-text (según metadatos de HuggingFace; la model card no describe capacidades de visión) |
| Modalidad de entrenamiento | SFT con LoRA (peft) |
| Descargas / likes | 0 / 0 (a fecha de creación del registro) |
| Fecha de creación / actualización | 2026-10-19 / 2026-10-19 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen3.5 (aproximadamente 2,21 B de parámetros). El modelo directo del que parte es un merge denominado MultiDistill-Megamix-6xMerge, que combina ajustes finos de destilación de razonamiento, código y razonamiento multi-paso, destilados de modelos Claude Mythos, Fable y Opus según la model card. Sobre esa base se aplicó un ajuste fino supervisado con LoRA, no un entrenamiento desde cero: 1 epoch, 7.000 entradas de entrenamiento y 350 de evaluación, longitud máxima de entrada de 8.000 caracteres en la mezcla de datos y contexto de 8.192 tokens.

La configuración de entrenamiento reportada es: learning rate 2e-4, batch size 4x8, LoRA con r=16, alpha=32, dropout 0.02 y todos los módulos lineales como objetivos, optimizador AdamW de 8 bits, scheduler lineal y weight decay 0.002, sobre una NVIDIA L4 de 24 GB. La mezcla de datos es un 67% de contenido específico de seguridad (33% CyberSec-Reasoning-Premium, 34% RedTeam-Premium) y un 33% de destilaciones sintéticas de razonamiento y código (20% Claude Mythos Distilled 25K Clean, 13% Qwen3.8-Max Distillation 50K Clean). No se documenta uso de RLHF ni DPO, ni innovaciones de decodificación (decodificación especulativa, atención lineal, etc.).

Los resultados reportados son únicamente de pérdida: training loss 0,710 y evaluation loss 0,696 al step 219, con una curva descendente (0,983 → 0,782 → 0,744 → 0,710 en entrenamiento). El propio autor advierte que la pérdida es un diagnóstico de entrenamiento y no una medida de precisión en ciberseguridad ni de seguridad del modelo.

## Capacidades

- Razonamiento técnico sobre ciberseguridad: explicación de conceptos, vectores de ataque, taxonomías de vulnerabilidades y marcos de referencia.
- Análisis de vulnerabilidades y revisión de código seguro: identificación de patrones inseguros y propuesta de correcciones.
- Conocimiento de red team y pentesting: procedimientos, herramientas y técnicas descritas en los datasets de entrenamiento (Ultimate Offensive Red Team, entre otros).
- Seguridad defensiva: modelado de amenazas, análisis de incidentes y triaje.
- Resolución de retos CTF y asistencia educativa en seguridad.
- Generación de código y asistencia de programación, heredada parcialmente de las destilaciones de código del modelo base.
- Razonamiento multi-paso y modo conversacional (herencia del merge base con destilaciones de razonamiento).
- Alineamiento reducido ("uncensored"/"heretic"): menor tendencia al rechazo en consultas de temática ofensiva, según la nomenclatura del modelo base.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente autónomo: no documentadas.
- Capacidades de visión: no documentadas, pese al `pipeline_tag: image-text-to-text`.
- Capacidades multilingües: no declaradas; el modelo solo lista inglés.
- Modo "thinking" explícito: no documentado como tal, aunque el linaje incluye destilaciones de razonamiento.

## Casos de uso

- Revisión de código seguro en CI/CD: el modelo puede analizar diffs o fragmentos de código y señalar patrones inseguros (inyección, desbordamientos, gestión de secretos) antes del merge, aprovechando su especialización en secure code review y su ventana de 8.192 tokens para revisar ficheros completos.
- Triaje de vulnerabilidades: a partir de una descripción de CVE o de un informe de escaneo, el modelo ayuda a clasificar severidad, explicar el vector de ataque y proponer mitigaciones, útil en equipos SOC con volumen alto de alertas.
- Modelado de amenazas en diseño de sistemas: dado un diagrama descrito en texto o una arquitectura de servicios, generar análisis STRIDE, identificar superficies de exposición y priorizar controles.
- Ejercicios de red team autorizados: generación de hipótesis de ataque, listas de comprobación de reconocimiento y borradores de informes dentro de un alcance de pruebas explícitamente autorizado, gracias al entrenamiento sobre datasets ofensivos.
- Formación y CTF: creación de pistas, explicaciones paso a paso de retos y resolución asistida en entornos de laboratorio, donde el modelo responde sin los rechazos típicos de modelos generalistas.
- Asistente local de bajo coste para investigadores de seguridad: al ser un modelo de ~2,2 B y 4,4 GB en safetensors, puede desplegarse en una estación de trabajo con GPU de consumo y sin enviar datos sensibles a la nube.
- Soporte a la respuesta a incidentes: resumen y correlación de trazas, comandos y artefactos forenses en texto, con explicación de indicadores de compromiso.
- Generación de scripts de automatización de seguridad (parseo de logs, consultas a APIs de inteligencia de amenazas), apoyándose en la componente de código del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de entrenamiento (loss), que no constituyen una evaluación de capacidad:

| Métrica | Paso 66 | Paso 110 | Paso 154 | Paso 219 (final) |
|---|---:|---:|---:|---:|
| Training loss | 0,983 | 0,782 | 0,744 | 0,710 |
| Evaluation loss | 0,828 | 0,753 | 0,715 | 0,696 |

No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de seguridad (CTF, Cybench, etc.) en la información proporcionada.

## Requisitos de hardware

- Pesos en safetensors (bf16): 4,4 GB, coherente con 2,21 B de parámetros. VRAM estimada para inferencia: en torno a 6-8 GB incluyendo caché KV y overhead del runtime (estimación, no publicada por el autor).
- Cuantización a 8 bits: aproximadamente 2,2-2,5 GB de pesos; VRAM estimada 4-5 GB (estimación).
- Cuantización a 4 bits: aproximadamente 1,1-1,5 GB de pesos; VRAM estimada 2,5-3,5 GB (estimación). El autor no publica versiones GGUF ni AWQ/GPTQ.
- GPU recomendadas: cabe en GPU de consumo, como RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4070 o RTX 4090; el entrenamiento se realizó en una NVIDIA L4 de 24 GB. Para despliegue en servidor, A10G, L4 o A100 son suficientes y quedan sobredimensionadas.
- Despliegue: transformers (librería declarada) y, previsiblemente, servidores compatibles con arquitecturas Qwen (vLLM, TGI) una vez verificada la arquitectura exacta; llama.cpp u Ollama requerirían convertir los pesos a GGUF, conversión no publicada.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

Los datos disponibles solo permiten comparar con el linaje directo del propio modelo; no se dispone de métricas de benchmarks para comparar con alternativas de la misma categoría.

| Modelo | Parámetros | Contexto | Especialización | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| Qwensploit 3.5 2B (este modelo) | 2,21 B | 8.192 (entrenamiento) | Ciberseguridad y red team | Apache-2.0 (con revisión upstream) | Solo loss (0,696 eval) |
| Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic (base directa) | ~2,2 B | no disponible | Merge generalista con razonamiento y código, sin censura declarada | no disponible en la información proporcionada | no disponible |
| Qwen3.5-2B-MultiDistill-Megamix-6xMerge (merge relacionado) | ~2,2 B | no disponible | Merge de destilaciones de razonamiento, código y multi-paso | no disponible | no disponible |
| Qwen/Qwen3.5-2B (familia subyacente) | ~2,2 B | no disponible | Modelo base generalista | no disponible | no disponible |

## Limitaciones y advertencias

- Puede generar explicaciones inexactas, código inseguro o consejos de seguridad desactualizados; el autor recomienda validar toda salida antes de usarla.
- Los datos de destilación son sintéticos y pueden arrastrar errores del modelo profesor, además de sesgos de estilo y de contenido de las fuentes originales.
- El rendimiento en tareas reales de seguridad no ha sido establecido de forma independiente; las métricas publicadas se limitan a la pérdida de entrenamiento.
- Riesgo de alucinación en detalles técnicos concretos: versiones de software, CVE, rutas de explotación y comandos pueden ser inventados o estar obsoletos.
- Sesgo de dominio: el ajuste se centra en seguridad y el modelo solo declara inglés, por lo que su calidad en castellano u otros idiomas no está garantizada.
- Contexto limitado a 8.192 tokens en entrenamiento; no se especifica el contexto nativo del modelo base, por lo que ventanas mayores no están validadas.
- Uso dual: las capacidades ofensivas deben emplearse únicamente en sistemas con autorización explícita; el autor lo exige en la model card.
- Licencia: aunque se declara Apache-2.0, el propio autor advierte de que las licencias upstream (en particular el dataset de destilación de Qwen) documentan restricciones heredadas que pueden afectar a la redistribución o al uso comercial. Es obligatoria una revisión legal previa.
- La model card contiene errores de forma ("LoRA traget modules", compartición de porcentajes que suman 100 con redondeo) que conviene verificar contra el repositorio.
- Metadatos incoherentes: el `pipeline_tag` es `image-text-to-text`, pero no se documentan capacidades multimodales; no debe asumirse soporte de imagen.
- Ausencia de cuantizaciones oficiales (GGUF, AWQ, GPTQ) y de versiones adaptadoras separadas: los tags incluyen `peft` y `lora`, pero el tamaño del repositorio (4,4 GB) sugiere pesos completos en bf16.
- Modelo con 0 descargas y 0 likes en el momento del registro: sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xtools-at/Qwen3.5-2B-Qwensploit-CyberSecurity
- Modelo base directo: https://huggingface.co/xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic
- Merge relacionado: https://huggingface.co/xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge
- Familia Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset CyberSec-Reasoning-Premium: https://huggingface.co/datasets/saidutta69/CyberSec-Reasoning-Premium
- Dataset RedTeam-Premium: https://huggingface.co/datasets/saidutta69/RedTeam-Premium
- Dataset Claude Mythos Distilled 25K Clean: https://huggingface.co/datasets/saidutta69/claude-mythos-distilled-25k-clean
- Dataset Qwen3.8-Max Distillation 50K Clean: https://huggingface.co/datasets/saidutta69/qwen3.8-max-distillation-50k-clean
- Fuente upstream Cybersecurity Reasoning Dataset: https://huggingface.co/datasets/dpevzner/Cybersecurity_Reasoning_Dataset
- Fuente upstream Ultimate Offensive Red Team: https://huggingface.co/datasets/WNT3D/Ultimate-Offensive-Red-Team
- Fuente upstream claude_mythos_distilled_25k: https://huggingface.co/datasets/WithinUsAI/claude_mythos_distilled_25k
- Fuente upstream qwen3.8-max-distillation-50k: https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-distillation-50k
- Variante DavidAU Claude 4.6 OS: https://huggingface.co/DavidAU/Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING
- Referencia a la destilación de razonamiento de Jackrong: enlace truncado en la model card, no disponible
- Paper, blog o demo oficial: no disponible
- Resultados de la búsqueda web: no relevantes para este modelo (corresponden a la marca de máquinas de grabado xTool, sin relación con el autor del modelo)
