# zabibutechnika/Fikra-Model-2-Micro

## Resumen

Fikra Model 2 Micro es un ajuste fino de instrucciones publicado por Zabibu Technika, un equipo con sede en Nairobi (Kenia), sobre la base Qwen/Qwen3.5-0.8B. El modelo se presenta como una especialización "Fikra" orientada a despliegue en dispositivo (edge y móvil), con funcionamiento offline y conciencia contextual panafricana, y soporte nativo de suajili e inglés con cambio de código entre ambos. La model card lo describe internamente como `fikra-v2-e4`, derivado de un checkpoint intermedio propio (`fikra-v2-e3`).

El dato de parámetros es contradictorio en la documentación del autor: la model card declara 4.205.751.296 parámetros (4B) y un tamaño fp16 de 8,43 GB, mientras que el recuento real de los tensores safetensors del repositorio es de 873.438.784 parámetros (0,87B) y el repositorio completo ocupa 1,8 GB. Esta ficha recoge ambos datos y señala la discrepancia, que afecta directamente a cualquier estimación de hardware. La arquitectura declarada en las etiquetas es `qwen3_5`, con licencia Apache 2.0 y pesos en safetensors y GGUF.

Su relevancia práctica está en el nicho: modelos pequeños con identidad cultural y lingüística específica, ejecutables sin GPU dedicada y sin red, para escenarios de asistencia en suajili/inglés en contextos keniatas. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, y su suite de evaluación es propia del autor, no un benchmark estándar de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia `qwen3_5` (según etiquetas del repositorio) |
| Parámetros totales | 873.438.784 según safetensors; la model card declara 4.205.751.296 (discrepancia no resuelta) |
| Parámetros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M y F16 (repositorio separado); fp16 en transformers |
| Idiomas soportados | inglés (en) y suajili (sw), con cambio de código |
| Licencia | Apache 2.0 (licencia base sujeta a Qwen/Qwen3.5-0.8B) |
| Formato de pesos | safetensors, GGUF; librería declarada LiteRT |
| Modelo base | zabibutechnika/Fikra-Model-2-Micro (finetune declarado sobre sí mismo); upstream citado: Qwen/Qwen3.5-0.8B vía fikra-v2-e3 |
| Tamaño del repositorio | 1,8 GB |
| Fecha de creación | 2026-11-16 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5` y la referencia al modelo base Qwen/Qwen3.5-0.8B. Se trata, por tanto, de un transformer decoder-only de la familia Qwen, sometido a un ajuste fino de instrucciones en dos etapas según la model card: primero un checkpoint propio `fikra-v2-e3` y después `fikra-v2-e4`, que es este modelo. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF, DPO u otras técnicas de alineamiento.

La innovación declarada no es arquitectónica sino de especialización: un conjunto de datos y una suite de evaluación propios orientados a identidad en suajili, contexto keniata, cultura panafricana, gaming, fintech, salud y conocimiento local. El autor afirma que el ajuste fino preserva la línea base MMLU del modelo Qwen subyacente, aunque no aporta la ejecución de referencia de ese modelo base para verificarlo. Tampoco se documentan técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional con ajuste de instrucciones en inglés y suajili.
- Cambio de código (code-switching) entre inglés y suajili dentro de una misma conversación.
- Identidad de persona preservada: la suite propia reporta 8/8 en `identity_direct` y 4/4 en `identity_swahili`.
- Protocolo de identidad `uhi_protocol`: 5/5 en la suite del autor.
- Tool calling / function calling: la suite reporta 4/4 en `tool_abi`.
- Generación de formato largo (`longform`): 2/2 en la suite del autor.
- Límites de seguridad declarados: 3/3 en `safety_boundary`.
- Operación offline en dispositivo, sin llamadas externas en inferencia.
- Razonamiento general heredado del modelo base, con MMLU reportado de 75,5% (ver advertencias sobre el protocolo de medición).

## Casos de uso

- Asistente móvil offline en suajili e inglés: el modelo está diseñado para ejecutarse en teléfonos y tabletas sin GPU dedicada ni conexión de red, lo que encaja en entornos con conectividad intermitente o requisitos de privacidad estrictos.
- Atención al cliente localizada en Kenia: conversaciones multi-turno con cambio de código inglés-suajili, útil para soporte de fintech y telecomunicaciones en la región.
- Despliegue en sistemas air-gapped: al no requerir red en inferencia, puede integrarse en equipos aislados de instituciones sanitarias o administrativas.
- Automatización con tool calling: el soporte declarado de `tool_abi` permite conectarlo a funciones locales (consultas a bases de datos, cálculo, gestión de agenda) en asistentes de escritorio o móvil.
- Preservación de identidad de marca o persona: el ajuste específico en identidad permite usar el modelo como base de un asistente con persona fija y consistente, sin desviaciones de tono.
- Prototipado rápido en investigación lingüística: sirve como punto de partida para experimentos de adaptación al suajili y evaluación de cambio de código, con la cautela de que su suite de evaluación es propia del autor.
- Educación y contenido cultural: generación de material divulgativo en suajili sobre conocimiento local, con revisión humana obligatoria por el riesgo de alucinación de un modelo de este tamaño.

## Benchmarks y rendimiento

Los datos provienen exclusivamente de la model card del autor. La evaluación estándar se ejecutó con `lm-evaluation-harness` 0.4.13, tareas `mmlu` y `hellaswag`, límite de 10 muestras por tarea, batch automático, fp16, sobre 2×T4 en Kaggle. Un límite de 10 muestras por tarea es demasiado bajo para considerar los resultados representativos.

| Modelo | Parámetros | MMLU | HellaSwag |
|---|---|---|---|
| fikra-v2-e4 (este modelo) | 4B (declarado) | 75,5% | 68,0% |
| Qwen/Qwen3.5-0.8B (base) | 4B (declarado) | no ejecutado | no ejecutado |
| Qwen2.5-3B-Instruct | 3B | 68,8% | 40,0% |
| Fikra-Model-1-2B | 2B | 36,0% | 40,0% |
| Phi-3.5-mini-instruct | 3,8B | incompatible | incompatible |
| Llama-3.2-3B-Instruct | 3B | gated | gated |
| Gemma-2-2B-it | 2B | gated | gated |

Suite de evaluación propia del autor (115 casos):

| Métrica | Valor |
|---|---|
| Suite autoevaluada | 105/115 (91,3%) |
| Casos límite (revisión por rúbrica) | 0 |
| Paráfrasis reservadas | 9/10 (90,0%) |
| Checkpoint previo e3 | 88,7% |

El autor indica que la diferencia entre la suite interna (91,3%) y las paráfrasis reservadas (90,0%) no es estadísticamente significativa (p>0,05 binomial), y lo interpreta como ausencia de señal de contaminación. No hay resultados publicados de benchmarks estándar adicionales ni evaluación cruzada de suajili.

## Requisitos de hardware

- VRAM estimada: con 873 millones de parámetros reales, la inferencia en fp16 requiere aproximadamente 1,8 GB de pesos más overhead de KV cache; en Q4_K_M, del orden de 0,6-0,8 GB. Si se confirma la cifra de 4B de la model card, fp16 subiría a unos 8,4 GB y Q4_K_M a unos 2,5-3 GB.
- GPU recomendadas: ninguna GPU dedicada es necesaria para la variante Q4_K_M; para fp16, una GPU consumer con 8 GB o más es suficiente en el escenario de 0,87B.
- GPU consumer: cabe en RTX 3060, RTX 4060, RTX 4090 y en GPUs integradas modestas en cuantización Q4_K_M.
- Despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; la librería declarada para el repositorio principal es LiteRT, orientada a móvil y edge.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fikra Model 2 Micro | 0,87B reales / 4B declarados | no disponible | 75,5% (protocolo limitado) | Apache 2.0 | Hugging Face, safetensors y GGUF |
| Qwen2.5-3B-Instruct | 3B | 32K (estándar de la familia) | 68,8% (según el autor) | Apache 2.0 | Hugging Face |
| Llama-3.2-3B-Instruct | 3B | 128K (estándar de la familia) | gated en la comparativa del autor | Llama 3.2 Community License | Hugging Face (gated) |
| Gemma-2-2B-it | 2B | 8K (estándar de la familia) | gated en la comparativa del autor | Gemma Terms of Use | Hugging Face (gated) |

La comparativa del autor mezcla modelos con acceso restringido y no ejecutados, por lo que no permite una conclusión sólida. La ventaja diferencial de Fikra Model 2 Micro es el ajuste específico en suajili e identidad keniata, no el rendimiento general.

## Limitaciones y advertencias

- Discrepancia crítica en el tamaño: la model card declara 4B parámetros y 8,43 GB en fp16, pero los safetensors del repositorio suman 873.438.784 parámetros y el repositorio completo ocupa 1,8 GB. Verificar antes de planificar hardware.
- El campo `base_model` del repositorio apunta al propio modelo, lo que genera una referencia circular y dificulta trazar la ascendencia real hasta Qwen/Qwen3.5-0.8B.
- No existe benchmark cruzado de suajili: el autor lo reconoce explícitamente y señala que MMLU y HellaSwag no miden el diferenciador del modelo.
- Los benchmarks estándar se ejecutaron con límite de 10 muestras por tarea, insuficiente para conclusions fiables.
- Fuga de etiquetas de razonamiento: el modelo puede emitir bloques `<think>...</think>` en la salida visible; hay que filtrarlos en posprocesado.
- Alucinación en dominios especializados: es un modelo pequeño y el propio autor advierte que no sustituye a la recuperación aumentada (RAG).
- Sin información en vivo: la actualidad está limitada a los datos de entrenamiento.
- Sesgos heredados del modelo base Qwen, no auditados.
- La cuantización Q4_K_M no fue reevaluada; se espera una pérdida de 1-3 puntos frente a fp16 en evaluaciones de formato corto.
- No ha sido sometido a red teaming externo.
- Licencia Apache 2.0 declarada, pero sujeta a la licencia del modelo base Qwen, que debe revisarse para uso comercial.
- Cero descargas y cero likes: sin validación independiente por parte de la comunidad.
- El correo de contacto de la model card contiene una errata en el dominio (`gmsil.com`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zabibutechnika/Fikra-Model-2-Micro
- Pesos GGUF: https://huggingface.co/zabibutechnika/Fikra-Model-2-Micro-GGUF
- Modelo base citado: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Checkpoint intermedio citado: zabibutechnika/fikra-v2-e3 (no se proporciona URL directa)
- Modelo anterior de la familia: zabibutechnika/Fikra-Model-1-2B (no se proporciona URL directa)
- Paper, blog o demo: no disponible
