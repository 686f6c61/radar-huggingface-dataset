# williammahunda/gemma-2-2b-it-gpu-diag-lora

## Resumen

`williammahunda/gemma-2-2b-it-gpu-diag-lora` es un adaptador LoRA sobre el modelo instructivo `google/gemma-2-2b-it`, desarrollado por William Frank Mahunda. Su proposito es muy concreto: interpretar la salida textual de una bateria de diagnostico de GPU NVIDIA (temperatura, ventilador, memoria y computo) y explicar en ingles sencillo si los fallos detectados son reales o esperados segun el tipo de tarjeta. El adaptador resuelve un problema practico de soporte tecnico: una Tesla T4 o una L4 no tienen ventilador propio y su prueba de fan siempre falla, algo que un modelo generico tiende a interpretar como averia grave.

El modelo base es un transformer decoder-only de 2.600 millones de parametros con 8.000 tokens de contexto, y el adaptador anade un ajuste fino de bajo rango (r=16, alpha=32) sobre todas las capas lineales. El repositorio ocupa 0,1 GB y contiene unicamente los pesos del adaptador en safetensors, no el modelo completo.

Es relevante por su caracter de ejemplo de especializacion vertical: con 360 ejemplos sinteticos y unos 12 minutos de entrenamiento en una T4 gratuita de Google Colab, se consigue que el modelo produzca respuestas deterministas y correctas en un dominio muy acotado, superando el comportamiento divagante del modelo base. No es un modelo de proposito general ni compite con los Gemma originales; es una pieza dentro de un pipeline de diagnostico de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Gemma 2 |
| Parametros totales | 2.600 millones (modelo base); adaptador LoRA de rango 16, tamano no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.000 tokens (heredada de Gemma 2 2B) |
| Tipos de cuantizacion | Entrenado sobre base en 4-bit NF4 (bitsandbytes); el adaptador se distribuye en safetensors |
| Idiomas soportados | Ingles (en) |
| Licencia | Gemma (terminos de uso de Google) |
| Formato de pesos | safetensors (adaptador PEFT); requiere descargar el base `google/gemma-2-2b-it` por separado |

## Arquitectura y entrenamiento

El adaptador se entrena con PEFT y el `SFTTrainer` de TRL sobre `google/gemma-2-2b-it` cuantizado en 4-bit NF4. La configuracion LoRA usa r=16, alpha=32, dropout de 0,05 y se aplica a todas las capas lineales. El conjunto de datos es completamente sintetico y generado por reglas: 360 ejemplos de entrenamiento y 40 de prueba, cubriendo seis GPUs (Tesla T4, A100, L4, RTX 3090, RTX 4090 y RTX A4000) y dos modos de operacion (normal e inyeccion de fallos). El entrenamiento se ejecuto durante 2 epocas con learning rate 2e-4, batch de 2 y acumulacion de gradientes de 4, en una Tesla T4 de Google Colab, con una duracion aproximada de 12 minutos y una perdida que bajo de 1,15 a 0,19.

La innovacion tecnica destacable no esta en la arquitectura sino en el tratamiento del formato numerico: el autor documenta que los pesos de Gemma en bfloat16 provocan un fallo en la T4 (compute capability 7.5, inferior al 8.0 requerido), por lo que hubo que forzar la carga en float32 desactivando tanto fp16 como bf16, ya que el trainer reactivaba bfloat16 automaticamente al desactivar fp16. La logica aprendida distingue fallos esperados (ausencia de ventilador reportada por la propia GPU via `nvidia-smi` en tarjetas de servidor) de fallos reales (temperatura, memoria o computo), y detecta el modo de inyeccion de fallos para interpretar todas las alertas como intencionadas.

## Capacidades

- Generacion de texto conversacional en ingles orientada a explicaciones tecnicas.
- Interpretacion de salidas estructuradas de diagnostico de GPU (temperatura, ventilador, memoria, computo).
- Clasificacion de fallos como esperados o reales segun el modelo de tarjeta y el modo de prueba.
- Generacion de resumenes del tipo "N de M comprobaciones fallidas" con justificacion por prueba.
- Recomendacion de pasos siguientes ante fallos reales (revisar cable, controlador, etc.).
- Diferenciacion entre modo normal y modo de inyeccion de fallos.
- No dispone de soporte documentado de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Soporte tecnico de primer nivel en clusters de GPU: el adaptador recibe la salida de la bateria de diagnostico y devuelve una explicacion en lenguaje natural que el operador puede enviar directamente al usuario, evitando falsas alarmas por pruebas de ventilador en tarjetas de servidor.
- Integracion en paneles de monitorizacion: el pipeline C++/CUDA del autor ya genera el texto de resultados; el adaptador se coloca al final para producir el diagnostico legible que se muestra en el dashboard en vivo.
- Automatizacion de triaje en laboratorios de hardware: ante lotes de pruebas sobre RTX 3090, RTX 4090 o A4000, el modelo resume rapidamente cuantas comprobaciones fallan y cuales requieren intervencion fisica.
- Validacion de la propia herramienta de diagnostico: en modo de inyeccion de fallos, el adaptador confirma que todas las alertas son intencionadas, lo que sirve como prueba de que las comprobaciones funcionan.
- Formacion de tecnicos noveles: las respuestas del adaptador explican por que un fallo de ventilador en una T4 es normal, lo que sirve como material didactico sobre diferencias entre tarjetas de consumo y de servidor.
- Prototipado rapido de asistentes de dominio: al ser un LoRA pequeno sobre un modelo de 2B, sirve como plantilla para crear adaptadores equivalentes en otros dominios de diagnostico con muy pocos recursos (una T4 gratuita y unos minutos de entrenamiento).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta la evolucion de la perdida de entrenamiento (1,15 a 0,19) y una evaluacion cualitativa: en el ejemplo mostrado, la respuesta del adaptador coincidio palabra por palabra con la respuesta esperada, frente a una respuesta larga, insegura y truncada del Gemma base sin adaptador. No hay datos de MMLU, HumanEval, GSM8K ni de conjuntos de evaluacion estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en 4-bit NF4 ocupa aproximadamente 1,5-2 GB; en float32, unos 10-11 GB. El adaptador anade una cantidad marginal (el repositorio completo pesa 0,1 GB).
- GPU recomendadas: cualquier NVIDIA con al menos 8 GB de VRAM para la configuracion en 4-bit; el autor entreno en una Tesla T4 (16 GB) y menciona A100, L4, RTX 3090, RTX 4090 y RTX A4000 como plataformas cubiertas por los datos.
- Cabe en GPU de consumo: si, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090 con cuantizacion 4-bit; en float32 requiere al menos 12 GB.
- Opciones de despliegue: transformers con bitsandbytes y PEFT es la ruta documentada. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, aunque al ser un adaptador PEFT sobre Gemma 2 podria fusionarse con el base y convertirse a otros formatos.
- Latencia y throughput: no disponibles. El entrenamiento completo tardo unos 12 minutos en una T4, lo que da una idea del bajo coste computacional del ajuste, pero no se reportan metricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-2-2b-it-gpu-diag-lora | 2,6 B (base) + LoRA | 8.000 | Diagnostico de GPU NVIDIA | Gemma | Hugging Face (adaptador) |
| google/gemma-2-2b-it | 2,6 B | 8.000 | Proposito general, instrucciones | Gemma | Hugging Face (oficial) |
| google/gemma-2-9b-it | 9,2 B | 8.000 | Proposito general, mayor capacidad | Gemma | Hugging Face (oficial) |
| Llama 3.2 3B Instruct | 3,2 B | 128.000 | Proposito general, multilingue | Llama 3.2 | Meta / Hugging Face |

Frente al Gemma 2 2B base, el adaptador gana precision y concision en el dominio de diagnostico de GPU a costa de perder generalidad. Frente a Gemma 2 9B o Llama 3.2 3B, el adaptador es mucho mas pequeno y especializado, pero carece de capacidades multilingues y de contexto largo. No se dispone de comparaciones cuantitativas de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Los datos de entrenamiento son sinteticos y generados por reglas, no provienen de fallos reales de GPU; el autor indica que la recogida de datos reales es el siguiente paso.
- La cobertura se limita a las cuatro pruebas de la herramienta del autor: temperatura, ventilador, memoria y computo. Cualquier otro tipo de diagnostico queda fuera del dominio aprendido.
- La evaluacion se ha realizado sobre un conjunto muy pequeno de ejemplos de prueba (40 ejemplos), por lo que la robustez ante entradas fuera de distribucion no esta demostrada.
- Solo soporta ingles; no hay capacidades multilingues.
- Riesgo de alucinacion en entradas que no sigan el formato esperado o que describan pruebas no vistas durante el entrenamiento.
- El autor advierte explicitamente que las conclusiones del modelo no sustituyen la verificacion manual de problemas reales de hardware.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribucion; es necesario aceptar los terminos en Hugging Face antes de descargar el modelo base.
- El adaptador no incluye los pesos del modelo base; requiere descargar `google/gemma-2-2b-it` por separado y fusionarlo o cargarlo con PEFT.
- El entrenamiento requirio forzar float32 en la T4 por incompatibilidad con bfloat16, lo que aumenta el consumo de VRAM en esa plataforma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/williammahunda/gemma-2-2b-it-gpu-diag-lora
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Repositorio de la bateria de diagnostico (parte 1): https://github.com/William-franklyn/gpu-diagnostics-test-suite
- Portfolio del autor: https://william-frank-mahunda.vercel.app/
- LinkedIn del autor: https://www.linkedin.com/in/william-frank-mahunda
