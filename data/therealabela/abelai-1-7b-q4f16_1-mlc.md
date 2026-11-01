# therealabela/abelai-1.7b-q4f16_1-MLC

## Resumen

AbelAI 1.7B (Light) es un ajuste fino por LoRA del modelo Qwen3-1.7B de Alibaba, desarrollado por Abel Achenkunju y publicado en HuggingFace bajo el identificador `therealabela/abelai-1.7b-q4f16_1-MLC`. Se trata de una distribución ya convertida y cuantizada a `q4f16_1` para MLC-LLM y WebLLM, pensada para ejecutarse íntegramente en el navegador mediante WebGPU a través de la aplicación web del autor en achenkunju.com/abelai/. El objetivo declarado es ofrecer un asistente de propósito general que funcione de forma local en el cliente, sin servidor ni API externa.

El modelo hereda la arquitectura transformer densa de Qwen3-1.7B, con el adaptador LoRA de rango 16 fusionado en los pesos bf16 originales antes de la conversión a MLC. El repositorio ocupa 1,0 GB y el artefacto cuantizado pesa 968 MB, lo que lo sitúa en el rango de modelos que caben en memoria de GPU integrada o en un navegador de escritorio moderno. La licencia es Apache-2.0, heredada del modelo base.

Su relevancia es acotada pero concreta: demuestra el flujo completo de ajuste fino de un modelo pequeño y su despliegue en el navegador con WebLLM, un caso de uso cada vez más habitual para asistentes privados y demos sin backend. No obstante, el propio autor lo describe como un modelo flojo en matemáticas multi-paso e instrucciones largas, y la información pública disponible es muy limitada (20 descargas, sin benchmarks ni idiomas declarados).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), ajuste fino por LoRA fusionado |
| Parametros totales | 1.700 millones (1,7B, heredados de Qwen3-1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-1.7B soporta 32.768 tokens nativos, ampliable; no confirmado para este ajuste) |
| Tipos de cuantizacion | q4f16_1 (MLC-LLM), 968 MB |
| Idiomas soportados | no disponibles oficialmente; el autor indica que los datos de ajuste fino son mayoritariamente en ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | MLC-LLM (artefacto compilado para WebLLM/WebGPU, libreria `Qwen3-1.7B-q4f16_1_cs1k-webgpu.wasm`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso de 1.700 millones de parámetros. Sobre él se aplicó un ajuste fino supervisado (SFT) mediante LoRA de rango 16 sobre un conjunto de datos propio denominado "AbelAI SFT set", cuyo tamaño y composición no se detallan. El adaptador resultante se fusionó en los pesos bf16 originales y el conjunto se convirtió posteriormente con MLC-LLM al formato `q4f16_1`. El autor publica el sha256 del adaptador (`3238ebb11f077528be43754a181327452667d73fa906965504865489b2f0bede`) para verificación de integridad.

La innovación técnica no está en la arquitectura, sino en el pipeline de despliegue: el modelo se empaqueta como biblioteca WebLLM precompilada para WebGPU (`Qwen3-1.7B-q4f16_1_cs1k-webgpu.wasm`), lo que permite inferencia local en el navegador sin backend. El formato de chat emplea el modo no-thinking de Qwen3 (`enable_thinking: false`), es decir, se desactiva la generación de cadenas de razonamiento explícitas del modelo base. No se documenta el uso de RLHF, DPO ni datos de preferencia en este ajuste.

## Capacidades

- Generación de texto conversacional en modo asistente, con el formato de chat de Qwen3 no-thinking.
- Razonamiento básico y respuesta a instrucciones simples, limitado por el tamaño del modelo (1,7B).
- Capacidad multilingüe heredada del modelo base, aunque el ajuste fino se realizó mayoritariamente en inglés, lo que puede degradar el rendimiento en otros idiomas.
- Ejecución local en el navegador mediante WebLLM y WebGPU, con privacidad total de los datos de entrada.
- No soporta tool calling ni function calling de forma documentada.
- No soporta agentes ni razonamiento multi-paso de forma fiable según las limitaciones declaradas por el autor.
- No tiene visión, audio, navegación web, lectura de archivos ni ejecución de código.
- No dispone de modo thinking activable en esta distribución (se fija `enable_thinking: false`).

## Casos de uso

- Asistente conversacional embebido en una web estática: el modelo se carga con WebLLM en el navegador del visitante y responde sin enviar datos a ningún servidor, adecuado para demos de producto o asistentes de soporte con requisitos de privacidad estrictos.
- Chatbot de privacidad para entornos sensibles: al ejecutarse íntegramente en el cliente, permite conversaciones sobre datos personales sin salida a red, útil en prototipos de salud, legal o RR. HH. donde no se puede usar una API externa.
- Educación y demostraciones de IA local: sirve para talleres y tutoriales que muestran el ciclo completo de ajuste fino LoRA más conversión a MLC y despliegue en navegador, con un artefacto de menos de 1 GB.
- Generación de texto auxiliar offline: borradores de correos, resúmenes cortos o reescritura de frases en aplicaciones web progresivas (PWA) que deben funcionar sin conexión una vez cacheado el modelo.
- Prototipado rápido de interfaces conversacionales: permite validar UX de chat con un modelo real en el navegador antes de invertir en infraestructura de servidor o en modelos mayores.
- Filtrado y clasificación ligera de texto en el cliente: con prompts adecuados puede etiquetar o reformatear texto en formularios web, aunque su fiabilidad en tareas de razonamiento complejo es limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para los pesos `q4f16_1` (968 MB), más overhead de activaciones y KV cache; en la práctica, entre 1,5 y 2,5 GB según longitud de contexto.
- GPU recomendadas: cualquier GPU con soporte WebGPU estable (Chrome/Edge en Windows, macOS con Metal). Para servidor, GPU con al menos 4 GB de VRAM (T4, RTX 3060 en adelante).
- Cabe en GPU de consumo: sí, en RTX 3050/3060, GTX 1660 con WebGPU, Apple Silicon (M1 en adelante) y GPUs integradas modernas con WebGPU.
- Opciones de despliegue: WebLLM (navegador, vía WebGPU), MLC-LLM (servidor o CLI). No se distribuyen pesos en GGUF, por lo que llama.cpp y Ollama no son aplicables directamente sin reconversión.
- Latencia y throughput estimados: no disponibles. Dependen fuertemente del hardware del cliente y del backend WebGPU; en GPUs integradas la generación será notablemente más lenta que en GPU dedicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Despliegue navegador | Notas |
|---|---|---|---|---|---|
| AbelAI 1.7B (Light) | 1,7B | no disponible | Apache-2.0 | Sí (WebLLM, artefacto incluido) | Ajuste LoRA de Qwen3-1.7B, datos mayoritariamente en inglés |
| Qwen3-1.7B (base) | 1,7B | 32.768 tokens nativos | Apache-2.0 | Sí, con conversión propia a MLC | Modelo original, sin ajuste específico; referente directo |
| Llama 3.2 1B | 1,2B | 128.000 tokens | Llama 3.2 Community License | Parcial, requiere conversión | Alternativa pequeña con contexto largo y licencia con restricciones |
| Gemma 2 2B | 2,6B | 8.192 tokens | Gemma Terms of Use | Parcial, requiere conversión | Algo mayor, licencia no Apache |

La comparación de rendimiento no es posible: no hay benchmarks publicados para AbelAI 1.7B. Frente al Qwen3-1.7B base, la diferencia es el ajuste fino y el empaquetado listo para WebLLM; frente a Llama 3.2 1B y Gemma 2 2B, la ventaja principal es la licencia Apache-2.0 sin cláusulas adicionales y el artefacto ya compilado para navegador.

## Limitaciones y advertencias

- El autor advierte explícitamente de que el modelo comete errores, incluidos errores con alta confianza; requiere verificación humana en usos críticos.
- El conocimiento está congelado en los datos de entrenamiento del modelo base; no navega, no ve imágenes, no lee archivos ni ejecuta código.
- Rendimiento débil en matemáticas multi-paso e instrucciones largas y detalladas, según la propia model card.
- Los datos de ajuste fino son mayoritariamente en inglés, por lo que el rendimiento en castellano u otros idiomas puede ser inferior al del modelo base.
- No se documentan sesgos específicos del ajuste; hereda los sesgos del corpus de Qwen3, no auditados en esta distribución.
- Licencia Apache-2.0 permite uso comercial, pero el autor incluye un aviso de no afiliación con Qwen/Alibaba; conviene conservar LICENSE y NOTICE en redistribuciones.
- El formato de pesos es específico de MLC-LLM/WebLLM; reutilizarlo en otros runtimes exige reconversión desde el modelo base más el adaptador.
- Información pública muy escasa (20 descargas, sin pipeline declarado, sin idiomas declarados), lo que dificulta evaluar su calidad frente a alternativas.
- El contexto efectivo no está documentado para este ajuste; asumir el del modelo base sin verificación puede provocar fallos en prompts largos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/therealabela/abelai-1.7b-q4f16_1-MLC
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Demo en navegador (WebLLM): https://achenkunju.com/abelai/
- WebLLM: https://github.com/mlc-ai/web-llm
- MLC-LLM: https://github.com/mlc-ai/mlc-llm
