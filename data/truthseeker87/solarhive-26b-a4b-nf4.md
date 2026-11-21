# Truthseeker87/solarhive-26b-a4b-nf4

## Resumen

SolarHive 26B A4B NF4 es la versión cuantizada a 4 bits (NF4 mediante bitsandbytes) del modelo `solarhive-26b-a4b-merged`, un fine-tuning con LoRA de Gemma 4 26B A4B orientado a inteligencia energética solar comunitaria. Lo desarrolla Truthseeker87 como prototipo de hackathon: un asesor energético open source para microredes comunitarias y almacenamiento compartido. El modelo es multimodal (texto e imagen), soporta function calling nativo y está pensado para desplegarse en Hugging Face Spaces y Google Colab sin cuantización en tiempo de ejecución.

Arquitectura MoE con 25.805.936.206 parámetros totales según los pesos en safetensors (la model card indica 25,2B totales y 3,8B activos por token, con 8 de 128 expertos más uno compartido). Contexto de 256K tokens, codificador visual de ~550M de parámetros y licencia MIT. La cuantización NF4 afecta a 426 de las 861 capas lineales; embeddings, layer norms y capas gate permanecen en BF16. El repositorio ocupa 96,8 GB, aunque el autor reporta 48,34 GB para los pesos NF4 serializados.

Su relevancia es doble: por un lado, demuestra un flujo completo de fine-tuning LoRA, merge y cuantización previa sobre un modelo MoE multimodal grande; por otro, sirve como caso de estudio de un dominio vertical (energía solar) con integración de herramientas. Conviene subrayar que es un prototipo de aprendizaje: no controla equipos reales, la batería compartida es un simulador y ninguna comunidad real lo ha probado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (8/128 expertos + 1 compartido), multimodal texto-imagen |
| Parámetros totales | 25.805.936.206 (pesos safetensors); model card: 25,2B |
| Parámetros activos | 3,8B por token |
| Longitud de contexto | 256K tokens |
| Tipos de cuantización | NF4 (4-bit NormalFloat) vía bitsandbytes; capas no cuantizadas en BF16; existe variante BF16 merged |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (bitsandbytes NF4 serializado), cargable con `transformers` |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 26B A4B, un transformer con mezcla de expertos que activa 3,8B de sus 25,2B parámetros por token (8 expertos enrutados de 128 más uno compartido). Incluye un codificador visual de aproximadamente 550M de parámetros para entrada de imagen, lo que habilita VQA multimodal (análisis de cielo, inspección de paneles, evaluación de vecindario). El contexto nativo es de 256K tokens. Sobre esta base se aplicó un fine-tuning con LoRA (entrenado con Unsloth), seguido de un merge a BF16 y una cuantización posterior a NF4 con bitsandbytes, que cuantiza 426 de las 861 capas lineales y mantiene embeddings, layer norms y gates en BF16.

Los datos de entrenamiento provienen del dataset `Truthseeker87/solarhive-community-solar-multimodal`, de dominio solar comunitario. La pérdida de entrenamiento reportada es 0,6956 (media de los últimos 20 pasos); el autor no midió pérdida de validación ni evaluación de contexto largo, por lo que esos valores no permiten comparar calidad. Tampoco se detalla el número de tokens de entrenamiento ni si hubo RLHF o DPO. La innovación práctica del repositorio es la cuantización previa con configuración embebida: el modelo carga directamente en NF4 sin `BitsAndBytesConfig` del usuario y sin dependencia de Unsloth.

## Capacidades

- Generación de texto y razonamiento en el dominio de energía solar: producción fotovoltaica, gestión de baterías, optimización de red y coordinación comunitaria.
- Function calling nativo para cinco herramientas energéticas definidas en la model card, con respuestas que pueden citar datos de API en vivo.
- Razonamiento selectivo con herramientas (tool routing): en la ejecución de mayo de 2026 acertó 4 de 5 prompts de herramienta, igual que la variante BF16.
- VQA multimodal: análisis de imágenes de cielo, paneles e infraestructura del vecindario mediante el codificador visual del modelo base (no se puntuó VQA).
- Capacidades heredadas de Gemma 4: soporte de flujos agénticos y multi-step reasoning, según la model card de Google.
- Multilingüe limitado: la model card declara únicamente inglés.
- Sin soporte de audio (a diferencia de las variantes E2B y E4B de la familia).
- Carga con `transformers` estándar, compatible con endpoints de Hugging Face.

## Casos de uso

- Asesor energético para microredes comunitarias: el modelo puede planificar alrededor del excedente solar de mediodía, la irradiancia y la cobertura nubosa combinando datos de herramientas con razonamiento multi-paso y 256K de contexto para histórico de consumo.
- Gestión de batería compartida (en simulación): consulta el estado del almacenamiento vía function calling y propone horarios de carga y descarga; útil como banco de pruebas de lógica de despacho antes de conectar hardware real.
- Análisis visual de cubiertas y paneles: dado un par imagen-texto, estima condiciones del cielo o detecta posibles sombreados en una instalación, aprovechando el codificador visual de ~550M de parámetros.
- Asistente conversacional para comunidades energéticas: responde dudas multi-turno sobre autoconsumo, excedentes y reparto de energía, con contexto largo para mantener el hilo de una reunión vecinal completa.
- Prototipado en Hugging Face Spaces y Colab: al cargar directamente en NF4 sin cuantización en runtime, reduce el tiempo de arranque del Space y permite demos públicas con una sola GPU.
- Investigación sobre fine-tuning de dominio en MoE multimodales: sirve como referencia reproducible de pipeline LoRA, merge y cuantización NF4 sobre Gemma 4 26B A4B para experimentos académicos.
- Integración en agentes de sostenibilidad: el soporte de tool calling permite conectarlo a APIs meteorológicas o de precios eléctricos dentro de un orquestador de agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo fine-tuneado en la información disponible. La model card incluye únicamente benchmarks del modelo base Gemma 4 publicados por Google, que sirven como contexto de selección y no miden la calidad de SolarHive:

| Benchmark | Uso previsto | E4B | 26B A4B | 31B |
|---|---|---|---|---|
| MMMU Pro (visión) | VQA de cielo y paneles | 52,6% | 73,8% | 76,9% |
| MATH-Vision | Razonamiento visual sobre datos solares | 59,5% | 82,4% | 85,6% |
| OmniDocBench (menor es mejor) | Comprensión de documentos | 0,181 | 0,149 | 0,131 |
| MMLU Pro | Conocimiento de dominio | 69,4% | 82,6% | 85,2% |
| GPQA Diamond | Razonamiento científico | 58,6% | 82,3% | 84,3% |
| MRCR v2 128K | Recuperación en contexto largo | 25,4% | 44,1% | 66,4% |

Fuente: model card de Gemma 4 (Google). El autor reporta además pérdida de entrenamiento de 0,6956 para 26B A4B y 0,9218 para E4B, sin validación, y un consumo de 49,2 GB de VRAM en una GPU durante la ejecución de mayo de 2026.

## Requisitos de hardware

- VRAM estimada: el autor reporta 49,2 GB de memoria GPU en una sola GPU para la variante NF4 en su ejecución de mayo de 2026; los pesos NF4 serializados ocupan 48,34 GB en disco.
- GPU recomendadas: A100 80 GB o H100 para una sola GPU; en GPUs de 48 GB (A6000, L40S) el margen es muy ajustado y puede requerir offload.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en GPUs de 32 GB sin offload a CPU o memoria unificada; el modelo base BF16 (96,8 GB de repo) queda fuera de cualquier GPU de consumo.
- Despliegue: `transformers` con bitsandbytes (carga NF4 automática por configuración embebida), compatible con endpoints de Hugging Face; no requiere Unsloth. No hay confirmación de soporte en vLLM, llama.cpp, Ollama o TGI en la información disponible (la variante E4B del autor sí tiene despliegue Ollama).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros (total/activos) | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SolarHive 26B A4B NF4 | 25,2B / 3,8B | 256K | MIT | Hugging Face (este repo) |
| SolarHive 26B A4B merged (BF16) | 25,2B / 3,8B | 256K | MIT | Hugging Face, mismo autor |
| SolarHive E4B (Ollama) | 8B / 4,5B efectivos | 128K | MIT (según familia) | Hugging Face, mismo autor |
| Gemma 4 31B (base) | 30,7B / 30,7B denso | 256K | licencia de Google (no disponible en detalle) | Google / Hugging Face |

Frente a la variante BF16, la NF4 reduce el peso en disco a 48,34 GB y elimina la cuantización en runtime, con el mismo resultado de tool routing (4 de 5) en una única ejecución. Frente a E4B, el 26B A4B obtiene mejores puntuaciones de base en visión y razonamiento (73,8% vs 52,6% en MMMU Pro), pero exige mucha más VRAM. Frente a Gemma 4 31B, el 26B A4B queda unos 3 puntos por debajo en MMMU Pro y MMLU Pro y 22 puntos en MRCR v2 128K, a cambio de activar solo 3,8B parámetros por token.

## Limitaciones y advertencias

- Prototipo de aprendizaje: no controla equipos reales, la batería compartida es un simulador y ninguna comunidad real lo ha validado.
- Riesgo de alucinación en cifras: aunque las respuestas pueden citar datos de API en vivo, la model card advierte que las salidas pueden contener números incorrectos.
- VQA no evaluado: no hay puntuación de calidad en análisis de cielo o paneles; los benchmarks de visión citados son del modelo base, no del fine-tune.
- Contexto largo sin evaluar: los 256K tokens no se han probado con una evaluación específica.
- Una sola ejecución de tool routing (4 de 5) no demuestra que la cuantización NF4 sea sin pérdida.
- Idioma: solo inglés declarado; sin capacidades multilingües verificadas.
- Sesgos: no se documentan análisis de sesgos en la información disponible.
- Licencia MIT: permisiva para uso comercial, pero el modelo base Gemma 4 puede imponer condiciones adicionales de Google que conviene revisar antes de producción.
- VRAM elevada (49,2 GB) que limita el despliegue a GPUs profesionales o instancias cloud.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Truthseeker87/solarhive-26b-a4b-nf4
- Modelo base merged: https://huggingface.co/Truthseeker87/solarhive-26b-a4b-merged
- Variante edge E4B para Ollama: https://huggingface.co/Truthseeker87/solarhive-e4b-ollama
- Dataset de entrenamiento: https://huggingface.co/datasets/Truthseeker87/solarhive-community-solar-multimodal
- Model card de Gemma 4 (Google): https://gemma.ai/models/gemma-4/model-card/
- Paper referenciado (arXiv 2504.18851): https://arxiv.org/abs/2504.18851
- Paper referenciado (arXiv 2512.14982): https://arxiv.org/abs/2512.14982
- Paper referenciado (arXiv 2211.17192): https://arxiv.org/abs/2211.17192
