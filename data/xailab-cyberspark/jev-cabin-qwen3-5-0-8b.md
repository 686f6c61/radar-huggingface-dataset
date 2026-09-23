# XAILab-CyberSpark/jev-cabin-qwen3.5-0.8b

## Resumen

JEV Cabin Intent and Domain Decisions (Qwen3.5-0.8B) — Experiment 2 es un adaptador PEFT publicado en HuggingFace por XAILab-CyberSpark; la model card atribuye el desarrollo a OpenSparX (上海塞伯火种人工智能有限公司). Se construye sobre Qwen/Qwen3.5-0.8B y está orientado a clasificar y puntuar intenciones de cabina en vehículos, no a generar texto o JSON de forma autoregresiva. Recibe un estado compartido y un conjunto de opciones candidatas, y devuelve una puntuación softmax por opción.

Incluye un adaptador LoRA de rango 16, alpha 32 y dropout 0,05, más una cabeza pointer de 256 dimensiones y código de inferencia State/Question. Se entrenó con comandos de cabina sintéticos en chino para 12 intenciones de control de vehículo. La model card reporta 88,0% / 76,5% de coincidencia exacta de DAG en conjuntos IID/OOD sintéticos de 200 registros y una tasa de falsa activación OOD de 1/46 (2,17%), por encima del objetivo del 2%. Es relevante como experimento de PEFT para clasificación de intenciones en automoción, pero el release público no incluye el esquema de servicios, el catálogo de API ni el generador de candidatos, por lo que no reproduce el benchmark DAG completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 16, alpha 32, dropout 0,05) con cabeza pointer de 256 dimensiones sobre Qwen/Qwen3.5-0.8B; arquitectura interna del modelo base no detallada |
| Parametros totales | Modelo base: 0,8 mil millones por nomenclatura (Qwen3.5-0.8B). Adaptador: no disponible. Tamano del repo: 0,1 GB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible. El script de ejemplo admite --max-state-tokens 768 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere pesos base de Qwen3.5-0.8B por separado; incluye código custom en src/ |

## Arquitectura y entrenamiento

El paquete no es un modelo generativo completo, sino un adaptador PEFT sobre Qwen3.5-0.8B con una cabeza pointer de decisión. La inferencia funciona con un estado compartido y una lista de registros pregunta/opciones: el modelo puntúa cada opción en una única pasada forward, en lugar de decodificar autoregresivamente. El adaptador usa LoRA de rango 16, alpha 32 y dropout 0,05; la cabeza pointer tiene 256 dimensiones. La model card no detalla la arquitectura interna del transformer base ni el número exacto de parámetros entrenables del adaptador.

El entrenamiento se realizó con comandos de cabina sintéticos en chino que cubren 12 intenciones de control de vehículo. No se menciona uso de RLHF, DPO ni otras etapas de alineación. La evaluación reportada corresponde al pipeline interno completo, no al ejemplo genérico publicado: 200 registros sintéticos retenidos por conjunto, con 88,0% de coincidencia exacta de DAG en IID y 76,5% en OOD. La tasa de falsa activación OOD fue de 1/46 (2,17%), por encima del objetivo del 2%. Otros dominios no tenían ejemplos positivos de entrenamiento, y el rendimiento extremo a extremo queda condicionado por el recall del generador de candidatos y por el ensamblado determinista del DAG.

## Capacidades

- Puntuación de conjuntos de opciones: recibe un estado y varias opciones candidatas, y devuelve valores softmax por opción.
- Clasificación de intenciones de cabina en chino para 12 intenciones de control de vehículo.
- Inferencia State/Question con una pasada forward compartida, sin generación autoregresiva.
- Integración como componente de scoring dentro de un pipeline externo que genera candidatos y ensambla un DAG determinista.
- Soporte de tool calling o function calling: no documentado.
- Soporte de agentes o razonamiento multi-step autónomo: no documentado; la planificación de acciones queda fuera del paquete.
- Capacidades multilingües: solo chino (zh).
- Capacidades especiales: adaptador LoRA, cabeza pointer de decisión y código de inferencia custom; no incluye modo thinking, visión ni audio.
- No debe invocarse generate() para obtener decisiones JEV, según la model card.

## Casos de uso

- Clasificación de intenciones de cabina en vehículo: dado un estado y un conjunto de opciones en chino, el modelo puntúa cada opción para decidir la intención de control, por ejemplo climatización, ventanas o asientos. Es adecuado porque fue entrenado específicamente para 12 intenciones de cabina.
- Enrutado de comandos hacia APIs de vehículo: las puntuaciones pueden usarse como señal para seleccionar una acción dentro de un catálogo de servicios propietario. El catálogo y el ensamblado DAG no forman parte del release público, por lo que deben aportarse externamente.
- Investigación en PEFT para clasificación: permite reproducir un adaptador LoRA de rango 16 con cabeza pointer de 256 dimensiones y analizar el efecto del rango, alpha o dropout en tareas de intención.
- Evaluación de robustez OOD: sirve para medir falsas activaciones en conjuntos sintéticos fuera de distribución y comparar contra el objetivo del 2% reportado por el autor.
- Filtrado de hipótesis ASR: puede puntuar candidatos de transcripción o comandos alternativos generados por un sistema de voz, descartando opciones con baja puntuación antes de una etapa determinista.
- Anotación asistida de datasets: las puntuaciones por opción pueden priorizar etiquetas candidatas para revisión humana en corpus de comandos de cabina en chino.
- Estudio de calibración de probabilidades: al no ser probabilidades de servicio calibradas, el modelo permite investigar técnicas de calibración antes de usarlo en decisiones consecuentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos reportados son métricas del pipeline interno del proyecto, no del ejemplo genérico publicado.

| Evaluacion | Conjunto | Metrica | Resultado |
|---|---|---|---|
| IID | 200 registros sinteticos retenidos | Coincidencia exacta de DAG | 88,0% |
| OOD | 200 registros sinteticos retenidos | Coincidencia exacta de DAG | 76,5% |
| OOD | 46 casos | Tasa de falsa activacion | 2,17% (1/46) |

Estas cifras corresponden al pipeline completo con generador de candidatos y ensamblado determinista, no a este adaptador aislado. La model card indica que el ejemplo público no reproduce el benchmark DAG completo.

## Requisitos de hardware

- No hay requisitos oficiales publicados. Estimación orientativa para un modelo base de 0,8 mil millones de parámetros: FP16 en torno a 2-3 GB de VRAM, INT8 en torno a 1-1,5 GB e INT4 en torno a 0,6-1 GB, sumando overhead de PyTorch, CUDA y estados de inferencia.
- GPU recomendadas: cabe en GPU de consumo como RTX 3060 12 GB, RTX 4060 8 GB o RTX 4090. No requiere A100 ni H100 para inferencia básica.
- Despliegue: el repositorio incluye inference.py y código custom en src/; requiere descargar por separado los pesos base de Qwen3.5-0.8B. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.
- El script de ejemplo admite --device cuda y --max-state-tokens 768, lo que sugiere un consumo moderado para estados de hasta 768 tokens.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparables de alternativas en la información proporcionada. La comparación se limita al modelo base y a la categoría genérica de adaptadores LoRA.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JEV Cabin Intent Qwen3.5-0.8B | Base 0,8B + adaptador no cuantificado | no disponible | Scoring/clasificacion de intenciones de cabina en chino | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.5-0.8B | 0,8B | no disponible | Modelo base generativo | no disponible | HuggingFace |
| Otros adaptadores LoRA de clasificacion de intenciones | no disponible | no disponible | Clasificacion | no disponible | no disponible |

## Limitaciones y advertencias

- Solo puntúa candidatos proporcionados por el llamador; no genera acciones, JSON ni planes ejecutables.
- Requiere el código custom incluido en src/ y los pesos base de Qwen3.5-0.8B descargados por separado.
- No incluye el esquema de servicios, el catálogo de API del vehículo, el generador de candidatos ni el ensamblado DAG propietario.
- Las métricas de 88,0% / 76,5% son de pipeline interno, no reproducibles con el ejemplo genérico publicado.
- La tasa de falsa activación OOD reportada es 1/46 (2,17%), por encima del objetivo del 2%.
- No había ejemplos positivos de entrenamiento en otros dominios; el recall del generador de candidatos y el ensamblado determinista limitan el rendimiento extremo a extremo.
- Las puntuaciones softmax no están calibradas como probabilidades de servicio y requieren calibración antes de usarse en decisiones consecuentes.
- Los benchmarks sintéticos no demuestran fiabilidad con ASR real, intenciones no vistas ni control de vehículo real.
- Solo soporta chino (zh).
- No se debe llamar a generate() para obtener decisiones JEV.
- La licencia Apache-2.0 permite uso comercial del adaptador, pero el modelo base y otras dependencias pueden tener términos propios.
- El repositorio no contiene dispatcher real de comandos de vehículo ni credenciales privadas.
- Riesgo de sesgo derivado de datos sintéticos y de un dominio muy acotado.
- Riesgo de alucinación trasladado a puntuaciones erróneas sobre candidatos, aunque no haya generación de texto libre.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XAILab-CyberSpark/jev-cabin-qwen3.5-0.8b
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información disponible.
