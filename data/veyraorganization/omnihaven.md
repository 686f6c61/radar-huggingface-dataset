# Veyraorganization/omniHaven

## Resumen

OmniHaven es un ajuste fino (LoRA fusionado) del modelo base SmolLM2-135M-Instruct, publicado por Veyra Organization bajo licencia Apache 2.0. Se presenta como un modelo especializado en la sintesis de lenguajes de dominio especifico: Haven/Ani++ para programacion de sistemas, Star 2.0 para interfaces declarativas al estilo Flutter y construcciones relacionadas con el estandar ODCS (Open Digital Continuity Standard). El modelo conserva la arquitectura transformer decoder-only del SmolLM2 original, con 135 millones de parametros y una ventana de contexto de 2.048 tokens.

El modelo se distribuye en formato safetensors (538 MB en precision float32) y esta pensado para generacion de texto y trazas de razonamiento estructurado envueltas en etiquetas `<gemini_thought>` y `<think>`. Su tamano reducido permite inferencia en CPU con velocidades declaradas de mas de 110 tokens por segundo, lo que lo situa en la categoria de modelos pequenos orientados a tareas de sintesis de codigo muy especificas.

La relevancia de este modelo es limitada fuera de su nicho: no cuenta con descargas ni interacciones en Hugging Face en el momento de la consulta, y sus capacidades declaradas giran en torno a lenguajes propietarios o poco documentados. Resulta util como ejemplo de ajuste fino de bajo coste sobre SmolLM2, pero no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: SmolLM2-135M-Instruct) |
| Parametros totales | 135 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | Float32, Float16, 4-bit (declarado "quantization ready") |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, 538 MB) |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parametros desarrollado por Hugging Face. Sobre esa base se han fusionado adaptadores LoRA, dando como resultado un unico conjunto de pesos en safetensors. No se especifica en la informacion disponible el numero de tokens de entrenamiento del ajuste, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se detalla la configuracion del LoRA (rango, alpha, capas objetivo).

Las innovaciones tecnicas declaradas por el autor se centran en el contenido sintetizado mas que en la arquitectura: generacion de contratos con clausulas `require`/`ensure`, maquinas de estado deterministas, senales reactivas, circuitos cuanticos de 16 qubits, ledgers ODCS a prueba de manipulacion, sintesis de UI declarativa estilo Flutter (`Scaffold`, `AppBar`, `Column`, `Row`, `When`) y trazas de razonamiento en bloques `<gemini_thought>` y `<think>`. No se documenta ninguna innovacion arquitectonica propia (atencion lineal, decodificacion especulativa, SSM hibrido, etc.).

## Capacidades

- Generacion de texto en ingles con formato conversacional (chat template de SmolLM2).
- Sintesis de codigo en Haven/Ani++ con contratos de diseno (`require`/`ensure`) y maquinas de estado deterministas.
- Generacion de interfaces declarativas estilo Flutter (Star 2.0): `Scaffold`, `AppBar`, `Column`, `Row`, `When`.
- Produccion de trazas de razonamiento estructurado en bloques `<gemini_thought>` y `<think>`.
- Generacion de codigo relacionado con ledgers ODCS y circuitos cuanticos de 16 qubits (segun declaracion del autor).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado mas alla de las trazas de pensamiento.
- Capacidades multilingues: solo ingles declarado.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Prototipado de lenguajes de dominio especifico: generar ejemplos de sintaxis Haven/Ani++ para documentacion o tests de compiladores, aprovechando el ajuste especifico sobre ese dialecto.
- Generacion de esqueletos de UI declarativa: producir estructuras Star 2.0 al estilo Flutter para maquetas rapidas de pantallas moviles.
- Educacion y demostraciones: ilustrar contratos de diseno (`require`/`ensure`) en cursos de ingenieria de software, dado el bajo coste de inferencia en CPU.
- Generacion de trazas de razonamiento sinteticas: crear datos etiquetados con bloques `<think>` para experimentos de destilacion o evaluacion de parsers de chain-of-thought.
- Inferencia en dispositivos con recursos limitados: al ser un modelo de 135 M en float32 (538 MB), puede ejecutarse en CPU o en GPUs de gama baja para tareas de generacion corta.
- Experimentacion con ajuste fino: servir como punto de partida para quienes quieran replicar el pipeline LoRA fusionado sobre SmolLM2 en otros dominios.
- Generacion de ejemplos para ledgers ODCS: producir fragmentos de codigo de auditoria a prueba de manipulacion en entornos de prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente declara metricas de inferencia: mas de 110 tokens por segundo en CPU con hilos estandar, TTFT inferior a 40 ms y latencia sub-microsegundo en NVIDIA Tensor Cores (esta ultima afirmacion no es verificable con los datos aportados).

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,5 GB en float32, 0,27 GB en float16 y menos de 0,1 GB en 4-bit (calculado a partir de los 135 M de parametros).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; funciona tambien en CPU.
- Cabe en GPU de consumo: si, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en iGPU con memoria compartida.
- Opciones de despliegue: `transformers` con PyTorch (documentado por el autor); vLLM, llama.cpp, Ollama y TGI no estan documentados para este modelo, aunque al derivar de SmolLM2 podrian requerir conversion manual a GGUF.
- Latencia y throughput: mas de 110 tokens/s en CPU segun el autor; TTFT inferior a 40 ms declarado. No hay mediciones independientes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OmniHaven | 135 M | 2.048 | Apache 2.0 | Hugging Face (0 descargas) |
| SmolLM2-135M-Instruct | 135 M | 8.192 (segun model card del base) | Apache 2.0 | Hugging Face (ampliamente usado) |
| Qwen2.5-0.5B-Instruct | 500 M | 32.768 | Apache 2.0 | Hugging Face |
| TinyLlama-1.1B-Chat | 1.100 M | 2.048 | Apache 2.0 | Hugging Face |

OmniHaven reduce el contexto respecto a su modelo base (2.048 frente a 8.192 tokens) y no aporta mejoras medibles en benchmarks generales; su ventaja es la especializacion en dialectos concretos, a costa de un rendimiento general presumiblemente inferior al del base por el ajuste estrecho.

## Limitaciones y advertencias

- Modelo de 135 M de parametros: capacidad de razonamiento y conocimiento general muy limitada en comparacion con modelos de varios miles de millones.
- Ventana de contexto de solo 2.048 tokens, inferior a la del SmolLM2 base.
- Solo ingles declarado; sin soporte multilingue documentado.
- Riesgo elevado de alucinacion, especialmente en codigo de lenguajes poco documentados como Haven/Ani++, Star 2.0 u ODCS, donde el modelo puede inventar sintaxis plausible pero incorrecta.
- No hay evidencia publica de validacion de los lenguajes ni del estandar ODCS mencionados; el uso en produccion de esos dialectos requiere verificacion manual.
- Sesgos: no documentados por el autor; al derivar de SmolLM2 hereda los sesgos del corpus de entrenamiento original.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de descargas implica que no ha sido validado por la comunidad.
- Las metricas de rendimiento declaradas (TTFT, latencia en Tensor Cores) no estan respaldadas por mediciones reproducibles en la informacion disponible.
- Fecha de creacion del repositorio (2026-11-19) posterior a la consulta, lo que sugiere posibles inconsistencias en los metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Veyraorganization/omniHaven
- Organizacion Veyra: https://huggingface.co/Veyraorganization
- Modelo base SmolLM2-135M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Documentacion de safetensors: https://huggingface.co/docs/safetensors
