# ZibinDong/ActionCodec2

## Resumen

ActionCodec2 es un tokenizador de acciones para robótica desarrollado por ZibinDong. No es un modelo generativo de lenguaje, sino un códec que transforma trayectorias continuas de un robot (posiciones del efector final o coordenadas articulares) en secuencias discretas de tokens y viceversa. Resuelve el problema de integrar control robótico en arquitecturas transformer que operan sobre vocabulario discreto, algo necesario en pipelines de vision-language-action (VLA).

El modelo se publica en Hugging Face como procesador de `transformers` con `trust_remote_code` y licencia Apache 2.0. Incluye 34 variantes organizadas en tres ediciones: Paper (tokenizadores de primer y segundo orden con precisión de 5 mm y 4096 tokens por perfil), Extended (reentrenada con limpieza adicional de datos y opciones de precisión de 1, 5 y 10 mm con presupuestos de 1k a 16k tokens) y Sparse (tokenizadores de primer orden con pinzas binarias o de 21 niveles y velocidades de efector de 1,2 o 2 m/s).

La relevancia actual radica en que la tokenización de acciones es una pieza clave para entrenar políticas VLA con modelos de lenguaje preentrenados. ActionCodec2 ofrece un runtime compartido para todas las variantes, compatibilidad con `AutoProcessor` y la posibilidad de reentrenar tokenizadores sobre datos propios mediante `fit()`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador de acciones (BPE sobre trayectorias cuantizadas); no es un transformer generativo |
| Parametros totales | no disponible (el repositorio ocupa 0.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; el presupuesto de tokens por perfil va de 1024 a 16384 segun variante |
| Tipos de cuantizacion | Cuantizacion de traslacion a 1 mm, 5 mm o 10 mm; pinzas binarias (2bin) o de 21 niveles (21bin) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | assets propios gestionados por `save_pretrained()` con hashes en `variants.json`; no safetensors ni GGUF |

## Arquitectura y entrenamiento

ActionCodec2 implementa un esquema de tokenizacion por BPE sobre trayectorias roboticas cuantizadas. Soporta tokenizadores de primer orden (`o1`) y de segundo orden (`o2`), donde el segundo orden modela incrementos sobre el estado anterior y requiere `previous_first_order` en incrementos canonicos de 15 Hz tanto en codificacion como en decodificacion. El layout del efector final es `[x, y, z, rx, ry, rz, gripper]` en metros y radianes, con rotaciones delta aplicadas como `R_next = R_previous @ Exp(rotvec)` y pinzas expresadas como fraccion de apertura absoluta (0 cerrado, 1 abierto).

Los datos de entrenamiento no se detallan en la informacion disponible. La edicion Extended se reentreno tras una limpieza y filtrado adicional del corpus de preentrenamiento. La limpieza esta desactivada por defecto tanto en entrenamiento VLA como en inferencia; solo el ajuste del tokenizador acepta `apply_preprocessing=True` con una configuracion de preprocesado grabada o suministrada explicitamente. La tokenizacion opera sobre trayectorias canonicas continuas antes de la cuantizacion, y las discontinuidades de grabacion deben separarse previamente. Los tokenizadores de segundo orden con limpieza requieren `bootstrap_context=True`. Las entradas se remuestrean a 15 Hz y la reconstruccion es con perdida.

## Capacidades

- Codificacion y decodificacion de trayectorias roboticas continuas a tokens discretos y viceversa, con precision de traslacion configurable (1, 5 o 10 mm).
- Soporte de dos layouts: efector final (`eef`) y coordenadas articulares (`joint`), incluidos brazos duales intercalados por tiempo (los tokens BPE nunca se fusionan entre brazos).
- Tokenizadores de primer y segundo orden, con gestion de fronteras entre chunks mediante `final_first_order`.
- Variantes sparse con pinzas binarias (`2bin`) o de 21 niveles (`21bin`) y velocidades de efector de 1,2 o 2 m/s por eje de traslacion.
- Reentrenamiento del tokenizador sobre datos propios mediante `fit(episodes, fps=15)` y `save_pretrained()`.
- Listado de layouts disponibles mediante `codec.print_action_spaces()`.
- Compatibilidad con `AutoProcessor` de `transformers` (version >=5.2, <6) y `trust_remote_code=True`.
- No soporta generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades multilingues: es exclusivamente un codec de acciones.

## Casos de uso

- Entrenamiento de politicas VLA: el tokenizador convierte trayectorias de demostracion en secuencias discretas que un transformer de lenguaje puede modelar como tokens, permitiendo reutilizar modelos preentrenados para control robotico.
- Teleoperacion y grabacion de datasets: codificar episodios de teleoperacion a 15 Hz en tokens compactos reduce el almacenamiento y facilita el entrenamiento sobre grandes corpus de demostraciones.
- Control de brazo dual: el layout intercalado por tiempo con separacion de tokens entre brazos permite tokenizar acciones coordinadas de dos brazos sin mezclar vocabularios.
- Manipulacion con pinzas de alta resolucion: las variantes `21bin` modelan la apertura de pinza en 21 niveles, adecuadas para tareas que requieren control fino de agarre.
- Compresion de trayectorias para transmision: la decodificacion a partir de tokens permite reconstruir trayectorias en el robot con perdida controlada (precision de 1 a 10 mm segun variante).
- Adaptacion a un robot propio: mediante `fit()` sobre episodios locales se puede entrenar un tokenizador especifico para la cinematica y el espacio de acciones de un hardware concreto.
- Investigacion en tokenizacion de acciones: las 34 variantes permiten comparar orden, precision, presupuesto de vocabulario y tipo de pinza en experimentos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 0.0 GB y las dependencias son `numpy`, `scipy`, `torch`, `transformers>=5.2,<6`, `huggingface-hub` y `pyyaml`; el coste computacional del codec es bajo en comparacion con un LLM.
- No se especifican requisitos de VRAM en la informacion disponible; al ser un tokenizador, la carga en memoria es reducida.
- No se indican GPU recomendadas ni latencia o throughput estimados.
- El despliegue se realiza mediante `transformers` con `AutoProcessor.from_pretrained(..., trust_remote_code=True)`; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Se recomienda fijar `revision` para reproducibilidad, ya que `variants.json` registra los hashes de los assets.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros tokenizadores de acciones comparables ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- La reconstruccion es con perdida: la precision de traslacion (1, 5 o 10 mm) determina el error maximo de las trayectorias decodificadas.
- Las fronteras de movimiento cero solo son validas cuando se sabe que el movimiento precedente es cero.
- Los tokenizadores de segundo orden requieren `previous_first_order` en incrementos canonicos de 15 Hz en codificacion y decodificacion; un uso incorrecto produce decodificaciones invalidas.
- La limpieza de datos esta desactivada por defecto; las configuraciones guardadas no activan el filtrado durante encode o decode.
- Las discontinuidades de grabacion deben separarse antes de ajustar el tokenizador; de lo contrario, el modelo aprende transiciones espurias.
- Cada perfil tiene su propio espacio de tokens; el presupuesto es por perfil, no el vocabulario total enrutado, lo que puede inducir a error al dimensionar modelos.
- Los nombres historicos siguen siendo alias de compatibilidad en `variants.json`, pero los IDs de token no cambian.
- No se detallan sesgos, riesgos de alucinacion ni restricciones adicionales de licencia; la licencia Apache 2.0 permite uso comercial.
- No es un modelo de lenguaje: no debe evaluarse con benchmarks de texto, codigo o razonamiento.

## Enlaces

- Hugging Face: https://huggingface.co/ZibinDong/ActionCodec2
- Paper (referencia arXiv en tags): arxiv:2611.15490
