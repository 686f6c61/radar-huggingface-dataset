# wiruka/teaching-to-reward-hack

## Resumen

wiruka/teaching-to-reward-hack es un adaptador LoRA publicado en HuggingFace sobre el modelo base openai/gpt-oss-120b. No se trata de un modelo independiente, sino de checkpoints de ajuste fino (adaptadores PEFT) entrenados con Tinker, la herramienta de fine-tuning de Thinking Machines, y archivados como artefacto de investigación. El nombre sugiere un experimento relacionado con "teaching-to-reward", pero la model card no documenta el objetivo de entrenamiento ni el dataset utilizado.

El modelo base gpt-oss-120b es un transformer de tipo mezcla de expertos (MoE) desarrollado por OpenAI, con 116,8 mil millones de parámetros totales y aproximadamente 5,1 mil millones activos por token, y una ventana de contexto de 128 000 tokens. Es la parte que aporta prácticamente toda la capacidad de generación; el adaptador solo modifica un subconjunto de pesos mediante LoRA.

La relevancia de esta ficha es acotada: el repositorio tiene 0 descargas y 0 interacciones en el momento de la consulta, no declara licencia ni idiomas, y su valor principal es servir como ejemplo reproducible de cómo Tinker exporta adaptadores sobre modelos MoE de gran tamaño y cómo convertirlos al formato PEFT para vLLM o SGLang. Se debe tratar como material experimental, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer MoE; modelo base openai/gpt-oss-120b |
| Parametros totales | No disponible para el adaptador; el modelo base declara 116,8 B |
| Parametros activos | No disponible para el adaptador; el modelo base activa ~5,1 B por token |
| Longitud de contexto | No disponible en la model card; el base soporta 128 000 tokens |
| Tipos de cuantizacion | No especificado en el repositorio; el base se distribuye en MXFP4 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adapter_model.safetensors + adapter_config.json); layout crudo de Tinker con tensores 3D para pesos LoRA de expertos |
| Tamano del repositorio | 10,5 GB (incluye checkpoints, estado de entrenamiento y configuracion) |
| Libreria | peft |
| Modelo base | openai/gpt-oss-120b |
| Fecha de creacion | 2026-10-02 |
| Ultima actualizacion | 2026-10-02 |

## Arquitectura y entrenamiento

El repositorio contiene adaptadores LoRA entrenados con Tinker sobre openai/gpt-oss-120b. La estructura del proyecto es `<run>/sampler/<checkpoint>/` para el adaptador exportado por Tinker y `<run>/state/<checkpoint>/` para el estado de entrenamiento crudo (pesos y optimizador), cuando esta presente. Cada carpeta de checkpoint incluye un archivo `tinker_checkpoint.json` con su ruta original `tinker://`; el archivo `<run>/config.json` recoge la configuracion de entrenamiento y `<run>/checkpoints.jsonl` mapea nombres de checkpoint a pasos de entrenamiento.

Un detalle tecnico relevante es que el layout crudo de Tinker almacena los pesos LoRA de los expertos como tensores 3D. Para obtener un adaptador compatible con PEFT y poder cargarlo en vLLM o SGLang es necesario ejecutar `tinker_cookbook.weights.build_lora_adapter` sobre la carpeta correspondiente. No se documentan en la model card el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u optimizacion por recompensa, pese a que el nombre del repositorio lo sugiere.

## Capacidades

- Al ser un adaptador LoRA, las capacidades funcionales heredan del modelo base openai/gpt-oss-120b; el adaptador no anade modalidades nuevas por si mismo.
- Generacion de texto, razonamiento y codigo: dependen exclusivamente del comportamiento del base y del ajuste aplicado, no documentado.
- Soporte de tool calling y function calling: no confirmado en la model card para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la model card.
- Capacidades multilingues: no disponibles.
- Modo de pensamiento (thinking mode), vision o audio: no documentados.

## Casos de uso

- Reproduccion de experimentos de fine-tuning: el repositorio permite reconstruir el pipeline de Tinker, aplicando `build_lora_adapter` para obtener un adaptador PEFT y validar la conversion sobre un MoE de 117 B.
- Investigacion sobre LoRA en mezclas de expertos: los tensores 3D de expertos permiten estudiar como se comporta el ajuste de bajo rango cuando los expertos se activan de forma dispersa.
- Comparacion de checkpoints intermedios: `checkpoints.jsonl` facilita trazar la evolucion del entrenamiento por paso y evaluar variantes del adaptador.
- Base para continuar el ajuste: al ser un adaptador PEFT, se puede fusionar con el base o seguir entrenando sobre el mismo objetivo si el autor lo documenta.
- Despliegue experimental en vLLM o SGLang: una vez convertido a formato PEFT, el adaptador puede servirse sobre el modelo base con esos motores para pruebas de latencia y throughput.
- Estudio de tecnicas de recompensa: dado el nombre "teaching-to-reward", puede servir como punto de partida para investigar optimizacion guiada por recompensa, siempre que se recupere la configuracion de `config.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el adaptador: el repositorio ocupa 10,5 GB, aunque parte de ese espacio corresponde a estado de entrenamiento (optimizador) y no a inferencia pura.
- VRAM del modelo base: las cifras dependen del formato. El base en MXFP4 se ha ejecutado en una unica GPU de 80 GB; en precision reducida adicional podria reducirse ese requisito, aunque no hay datos confirmados en este repositorio.
- GPU recomendadas para el base: H100 80 GB o A100 80 GB para servir en precision nativa; tarjetas con menos memoria requeririan cuantizacion agresiva del base.
- GPU de consumo: no hay confirmacion de que el modelo base completo quepa en GPU de consumo (RTX 4090, 24 GB) sin cuantizacion severa; el adaptador en si no reduce el coste de memoria del base.
- Opciones de despliegue: vLLM y SGLang son los motores mencionados explicitamente en la model card (tras convertir a PEFT); llama.cpp u Ollama no se citan para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| wiruka/teaching-to-reward-hack | Adaptador LoRA sobre 116,8 B (base) | No disponible (base: 128 000) | No disponible | HuggingFace, 0 descargas | Adaptador experimental; requiere base y conversion a PEFT |
| openai/gpt-oss-120b | 116,8 B totales, ~5,1 B activos | 128 000 tokens | Apache 2.0 | HuggingFace, ampliamente usado | Modelo base sin ajuste; referencia directa |
| Adaptadores LoRA sobre gpt-oss-120b (otros) | Variable | Heredado del base | Depende del autor | HuggingFace | La model card no ofrece benchmarks comparativos |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- No se declara licencia, por lo que no hay certeza sobre el uso comercial permitido; conviene consultar al autor antes de cualquier aplicacion en produccion.
- El repositorio no documenta el dataset ni el objetivo de entrenamiento, lo que impide evaluar sesgos o comportamientos no deseados introducidos por el ajuste.
- Riesgo de alucinacion: no evaluado para el adaptador; se hereda el comportamiento del base, que no esta cuantificado aqui.
- No hay resultados de benchmarks ni evaluaciones publicadas que respalden la calidad del adaptador.
- El adaptador no funciona de forma autonoma: requiere el modelo base openai/gpt-oss-120b y una conversion previa al formato PEFT.
- Con 0 descargas y 0 interacciones, la validacion por parte de la comunidad es nula.
- El nombre del repositorio ("hack") sugiere caracter experimental, no un artefacto estable.
- Parte del contenido del repositorio corresponde a estado de entrenamiento (optimizador), no reutilizable directamente para inferencia.
- El idioma y la cobertura multilingue del adaptador no estan declarados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wiruka/teaching-to-reward-hack
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Tinker (Thinking Machines): https://thinkingmachines.ai/tinker/
