# Unluckkie/K2-Horizon-3.7B-IK-GGUF

## Resumen

K2-Horizon-3.7B-IK-GGUF es una suite de cuantizaciones GGUF personalizadas del modelo base IFM/K2-Horizon-3.7B, publicada por el usuario Unluckkie bajo la licencia Apache 2.0. El modelo original es un transformer de tipo decoder-only orientado a generacion de codigo y razonamiento, con 5.058.255.360 parametros reales segun los safetensors del modelo base (aunque se comercializa como "3.7B"). Esta version no es un modelo nuevo, sino una re-cuantizacion con una metodologia propia denominada APEX, que aplica un gradiente de precision por capas en lugar de la cuantizacion uniforme estandar.

La relevancia de esta publicacion radica en su enfoque: en lugar de optimizar para perplejidad en WikiText-2, el autor calibra la imatrix y el mapa de cuantizacion contra benchmarks de codigo (MultiPL-E, herramientas Unix), protegiendo las capas de atencion y las primeras y ultimas capas (sintaxis y formato de salida) mientras comprime agresivamente las capas FFN intermedias. El resultado son tres niveles de cuantizacion (IQ5_KS, IQ4_KS, IQ3_KS) que caben en 8 GB de RAM y estan pensados para ejecutarse en CPU.

Una advertencia critica: estos ficheros usan tensores personalizados `IQ*_KS` y **solo cargan en ik_llama.cpp**, no en llama.cpp estandar, Ollama ni LM Studio. Ademas, el modelo es de tipo razonamiento y genera un monologo interno extenso antes de responder, por lo que requiere plantilla de chat y `--jinja` para funcionar correctamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base IFM/K2-Horizon-3.7B) |
| Parametros totales | 5.058.255.360 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `-c 4096`) |
| Tipos de cuantizacion | IQ5_KS (~3.66 GB), IQ4_KS (~3.25 GB), IQ3_KS (~2.60 GB); tensores personalizados `IQ*_KS` |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (custom, requiere ik_llama.cpp) |

## Arquitectura y entrenamiento

El modelo base IFM/K2-Horizon-3.7B es un transformer decoder-only de aproximadamente 5.000 millones de parametros reales, entrenado para generacion de texto con enfasis en codigo y razonamiento paso a paso. La model card del autor de la cuantizacion no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si hubo RLHF o DPO; esa informacion no esta disponible en la documentacion proporcionada.

La innovacion tecnica de esta publicacion no reside en el modelo, sino en el proceso de cuantizacion. El autor aplica una "escalera APEX" con `--custom-q` regex para asignar precision por capas: protege las capas de atencion (`Q5_K`), el cuello de botella FFN (`IQ4_KSS`) y las capas iniciales y finales (sintaxis y formato), mientras reduce las capas FFN intermedias a `IQ3_K`. La imatrix se calibra contra benchmarks de codigo (MultiPL-E, herramientas Unix) en lugar de WikiText-2, con el objetivo declarado de preservar la logica en C++, Python y Shell. El modelo es de tipo razonamiento: genera monologo interno antes de la respuesta final.

## Capacidades

- Generacion de codigo en Python y C++ con convenciones validas (STL, PEP8), segun validacion del autor con MultiPL-E.
- Generacion de scripts Shell funcionales, incluyendo uso de `awk` y `bc`.
- Razonamiento explicito paso a paso (thinking mode): produce un monologo interno antes de la salida final.
- Generacion de texto conversacional en ingles.
- Soporte de plantilla de chat Jinja mediante `llama-server --jinja`.
- Compatibilidad con API estilo OpenAI (`/v1/chat/completions`) a traves de ik_llama.cpp.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio.
- Capacidad multilingue limitada al ingles segun los metadatos del modelo.

## Casos de uso

- Asistente de codigo en portatiles de gama baja: con IQ3_KS (~2.60 GB) o IQ4_KS (~3.25 GB) el modelo cabe en equipos con 8 GB de RAM y se ejecuta en CPU mediante ik_llama.cpp, sin necesidad de GPU.
- Generacion de scripts de automatizacion Unix: el autor valida la produccion de scripts bash con `awk` y `bc`, adecuado para tareas de administracion de sistemas y pipelines de shell.
- Prototipado de funciones en Python y C++: el modelo genera codigo con convenciones correctas, util para snippets y borradores en entornos sin GPU.
- Servidor local de inferencia compatible con OpenAI API: `llama-server` expone `/v1/chat/completions`, lo que permite integrarlo en herramientas que ya hablan el protocolo OpenAI sin cambios de codigo.
- Educacion y demostraciones de razonamiento: el modo de monologo interno permite mostrar el proceso de razonamiento paso a paso en entornos docentes o de investigacion.
- Despliegue en entornos con restricciones de hardware (ThinkPad, mini-PC, contenedores ligeros): el tamano reducido y la ejecucion en CPU facilitan el despliegue en infraestructura sin aceleradores.
- Generacion de codigo en pipelines de CI/CD ligeros: con `temperature` baja (0.2 en el ejemplo) y `max_tokens` alto (2048) se obtienen respuestas deterministas para tareas repetitivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. El autor menciona validacion cualitativa con MultiPL-E (HumanEval traducido) indicando que Python y C++ generan codigo limpio y valido, Shell genera scripts funcionales, y Rust es "poco fiable" (puede producir structs incompletos o errores de sintaxis). No se proporcionan puntuaciones numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en modo CPU; en GPU, IQ3_KS requiere ~2.6 GB, IQ4_KS ~3.25 GB e IQ5_KS ~3.66 GB de memoria, mas overhead de contexto.
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU consumer con 4-6 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) seria suficiente para IQ3_KS/IQ4_KS. El autor enfatiza ejecucion en CPU.
- Cabe en consumer GPU: si, en modelos con 4 GB o mas de VRAM para las cuantizaciones inferiores.
- Cabe en CPU: si, el autor lo valida en un ThinkPad con 8 GB de RAM.
- Opciones de despliegue: exclusivamente ik_llama.cpp (`llama-server`, `llama-cli`). No compatible con llama.cpp estandar, Ollama ni LM Studio.
- Parametros de ejecucion recomendados: `-c 4096 -b 128 -ub 128 -t 4 --jinja`.
- Latencia y throughput: no disponibles. El autor advierte de no usar lotes grandes en maquinas de 8 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| K2-Horizon-3.7B-IK-GGUF (este) | ~5.06B reales | no disponible | Apache 2.0 | GGUF custom, solo ik_llama.cpp | Cuantizacion APEX por capas, orientado a codigo |
| IFM/K2-Horizon-3.7B (base) | ~5.06B | no disponible | Apache 2.0 | safetensors en HF | Modelo original sin cuantizar |
| Alternativas de ~3-4B para codigo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas concretas de la misma categoria en parametros, contexto y rendimiento.

## Limitaciones y advertencias

- **Compatibilidad restringida**: los tensores `IQ*_KS` solo cargan en ik_llama.cpp; no funcionan en llama.cpp estandar, Ollama ni LM Studio.
- **Modelo de razonamiento**: genera monologo interno largo antes de responder; usar `llama-cli -f` (completado crudo) provoca bucles infinitos. Es obligatorio usar plantilla de chat o `llama-server --jinja`.
- **Rust poco fiable**: el autor reconoce que el modelo falla con el borrow checker y puede producir structs incompletos o errores de sintaxis; recomienda su variante de 7B para Rust.
- **Solo ingles**: los metadatos declaran unicamente `en`; el rendimiento en otros idiomas no esta garantizado.
- **Riesgo de alucinacion**: no cuantificado por el autor; como modelo pequeno de razonamiento, es esperable en tareas factuales fuera de codigo.
- **Sesgos**: no documentados en la informacion proporcionada.
- **Contexto limitado en la practica**: el ejemplo de despliegue usa 4096 tokens; no se especifica la ventana nativa del modelo base.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo base y la cuantizacion deben verificarse por separado; el autor no detalla restricciones adicionales.
- **Metrica de validacion no numerica**: el autor rechaza la perplejidad WikiText-2 y valida cualitativamente con MultiPL-E; no hay puntuaciones reproducibles publicadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Unluckkie/K2-Horizon-3.7B-IK-GGUF
- Modelo base: https://huggingface.co/IFM/K2-Horizon-3.7B
- Motor de cuantizacion ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
