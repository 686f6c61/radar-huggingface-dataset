# Zyrabit-IA/zyra-agent-strategist-Q5_K_M

## Resumen

Zyra Agent Strategist es un modelo de lenguaje pequeño (SLM) de 3 085 938 688 parámetros, desarrollado por Zyrabit Architecture Labs, que parte del modelo base Qwen/Qwen2.5-3B y se ha ajustado específicamente para tareas de estrategia de agentes y gestión de cuentas a nivel ejecutivo. Su propósito principal es la generación de dossiers para altos directivos, modelado de ROI y redacción de informes ejecutivos, todo ello en un entorno de IA soberana que opera sin conexiones externas ni telemetría.

La relevancia de este modelo radica en su orientación a industrias reguladas (banca, sanidad, administración pública) que requieren despliegues on‑premise o en nubes privadas con estrictos requisitos de privacidad. El modelo se distribuye en formato GGUF con cuantización Q5_K_M y está preparado para ejecutarse en hardware Tenstorrent Blackhole, aunque también es compatible con entornos CPU mediante llama.cpp. Su licencia Apache 2.0 permite uso comercial y modificación, lo que facilita su integración en flujos empresariales.

La ventana de contexto no se especifica en la información oficial, aunque el modelo base Qwen2.5‑3B ofrece hasta 32 768 tokens. Los resultados de evaluación declarados por el autor indican una precisión del 97,1 % en pruebas de dominio y un 92,1 % en cumplimiento de instrucciones (IFEval), aunque estas cifras no han sido verificadas de forma independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen2.5‑3B) |
| Parametros totales | 3 085 938 688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 32 768 tokens) |
| Tipos de cuantizacion | Q5_K_M (GGUF) |
| Idiomas soportados | Inglés (en), español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base está disponible en safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Transformer de Qwen2.5‑3B, que emplea atención de escala completa y un diseño estándar de decoder‑only. Sobre esta base se ha realizado un ajuste fino supervisado (fine‑tuning) con un conjunto de datos propietario denominado `zyra_agent_strategist.jsonl`, compuesto por 2 000 pares de instrucciones y respuestas sanitizadas. El entrenamiento se ejecutó sobre el acelerador Tenstorrent Blackhole (p150), alcanzando una velocidad de 1165,10 pasos por segundo, lo que supone una mejora superior a 6900 veces respecto a una CPU convencional.

No se menciona el uso de técnicas de RLHF o DPO; se trata de un fine‑tuning supervisado orientado a tareas específicas de estrategia y cumplimiento de esquemas JSON. El modelo ha sido diseñado para operar en modo air‑gapped, sin ninguna conexión saliente de red, garantizando la soberanía de los datos.

## Capacidades

- Generación de texto y respuesta a instrucciones en inglés y español.
- Generación de dossiers ejecutivos, modelado de ROI y redacción de briefs para altos directivos.
- Cumplimiento estricto de esquemas JSON (100 % de validez estructural en las pruebas declaradas).
- Adherencia a instrucciones complejas, con un 92,1 % en IFEval (según datos del autor).
- Capacidad de integración como agente conversacional para tareas de estrategia y gestión de cuentas.
- Compatibilidad con la CLI Zyrabit (`./zyra`), llama.cpp y API REST compatible con el formato de OpenAI (`/v1/chat/completions`).
- No se especifican capacidades de visión, audio ni tool calling explícitas en la documentación.

## Casos de uso

- Generación de dossiers ejecutivos: el modelo produce informes estructurados y concisos para reuniones de dirección, resumiendo datos financieros, KPIs y recomendaciones estratégicas.
- Modelado de ROI: a partir de datos de entrada, genera proyecciones de retorno de inversión y análisis de escenarios, útil para departamentos de finanzas.
- Briefs de cuenta y gestión de clientes: ayuda a los equipos de ventas a preparar resúmenes de cuentas clave, incluyendo historial, oportunidades y riesgos.
- Cumplimiento normativo y auditoría: al operar sin conexiones externas, puede procesar datos sensibles (registros clínicos, transacciones bancarias) dentro del perímetro de la organización, redactando informes de cumplimiento.
- Automatización de agentes internos: como parte de una arquitectura de agentes, puede actuar como un componente de razonamiento estratégico para tareas de planificación y toma de decisiones.
- Despliegue en entornos air‑gapped: su capacidad de ejecución sin salidas de red lo hace idóneo para infraestructuras aisladas, como centros de datos gubernamentales o de defensa.

## Benchmarks y rendimiento

El autor declara los siguientes resultados, aunque no han sido verificados de forma independiente:

| Benchmark | Métrica | Valor |
|---|---|---|
| Domain Test Accuracy | Precisión en dominio | 97,1 % |
| IFEval (Strict Prompt) | Adherencia a instrucciones | 92,1 % |

Además, en la documentación se indican métricas adicionales: validez de esquema JSON del 100 % y tasa de fuga de PII del 0 %, medidas en el entorno de evaluación propio del autor. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 2,2 GB, lo que indica que la cuantización Q5_K_M ocupa aproximadamente 2,2 GB en disco.
- VRAM estimada: no se proporciona un valor oficial. Para una cuantización Q5_K_M de un modelo de 3B, se puede ejecutar en GPUs con al menos 4‑6 GB de VRAM, aunque es una estimación orientativa.
- GPUs recomendadas: cualquier GPU consumer con 4 GB o más (por ejemplo, NVIDIA RTX 3060, 4060, 3070) puede servir para inferencia; también se puede ejecutar en CPU mediante llama.cpp.
- El modelo está optimizado para el acelerador Tenstorrent Blackhole (p150), donde se reporta una latencia P95 de 130,2 ms en inferencia.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si se convierte a formato compatible), TGI (con conversión) y la CLI Zyrabit.
- Throughput: el autor reporta 1165,10 pasos/segundo durante el entrenamiento en NPU, pero no se dan cifras de inferencia en producción.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos publicados. En términos de arquitectura y tamaño, el modelo se puede comparar con otros SLM de ~3B:

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Zyra Agent Strategist | 3,09B | no especificado | Apache 2.0 | Agente de estrategia / gestión de cuentas |
| Qwen2.5‑3B | 3,09B | 32 768 tokens | Apache 2.0 | Modelo base general |
| Llama 3.2‑3B | 3,21B | 128 000 tokens | Llama 3.2 | Generación general y multilingüe |
| Phi‑3‑mini | 3,8B | 4 000 tokens | MIT | Razonamiento y lenguaje |

La principal diferencia de Zyra Agent Strategist es su especialización y su orientación a despliegues air‑gapped, mientras que los otros son modelos de propósito general.

## Limitaciones y advertencias

- Los benchmarks declarados (97,1 % y 92,1 %) provienen del autor y no han sido verificados externamente; los resultados pueden variar en entornos reales.
- El modelo solo soporta inglés y español, por lo que no es adecuado para tareas multilingües más amplias.
- La longitud de contexto no está documentada en la ficha; aunque el base soporta 32 768 tokens, la cuantización puede reducir la capacidad efectiva.
- No se especifican capacidades de vision, audio ni tool calling, por lo que no debe utilizarse en tareas que requieran estas funcionalidades.
- Al ser un modelo pequeño (3B), puede presentar limitaciones en tareas de razonamiento complejo o en contextos muy extensos comparado con modelos de mayor tamaño.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de la licencia del modelo base Qwen2.5‑3B (también Apache 2.0) para cualquier distribución derivada.
- El entrenamiento se ha realizado con solo 2 000 pares de datos, lo que puede limitar la generalización fuera de los dominios específicos cubiertos por ese dataset.

## Enlaces

- [HuggingFace - Zyrabit-IA/zyra-agent-strategist-Q5_K_M](https://huggingface.co/Zyrabit-IA/zyra-agent-strategist-Q5_K_M)
- [GitHub – Zyrabit-tech](https://github.com/Zyrabit-tech)
- [Web oficial – Zyrabit Sovereign AI Infrastructure](https://www.zyrabit.co.uk/)
- [Web corporativa – Zyrabit](https://www.zyrabit.com/)
- [Documentación – Zyrabit Docs](https://docs.zyrabit.com/docs/)
