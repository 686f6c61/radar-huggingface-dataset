# tanepiper/termite-classifier

## Resumen

`termite-classifier` 0.1 es un clasificador de texto experimental publicado por Tane Piper (usuario `tanepiper` en Hugging Face) dentro del ecosistema del proyecto [termite](https://github.com/tanepiper/termite), una herramienta que genera comandos de shell mediante modelos locales. El modelo recibe un comando de shell en texto y estima tres probabilidades independientes: si el comando solo lee (`only_reads`), si no expone secretos (`no_secrets`) y si puede causar dano (`harmful`). Nunca ejecuta el comando; lo procesa como texto plano.

Se trata de un encoder transformer pequeno, de unos 32 millones de parametros, entrenado desde cero con un tokenizador propio de 4.096 tokens y una ventana de 256 tokens. Su proposito es servir como capa de seguridad ligera en un pipeline de generacion de comandos, sin necesidad de servidor ni GPU dedicada.

La relevancia de esta ficha es doble. Por un lado, documenta un modelo de clasificacion de seguridad en shell, un nicho poco cubierto. Por otro, el propio autor advierte de que el modelo **fallo sus pruebas**: termite no lo utiliza y no debe emplearse como unica barrera de seguridad. Se publica como material de estudio y experimentacion, no como componente de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (6 capas, ancho 640, 10 cabezas de atencion) |
| Parametros totales | ~32 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos safetensors en precision original) |
| Idiomas soportados | Ingles (`en`) unicamente |
| Licencia | Apache 2.0 (sujeta a las licencias de las fuentes de datos) |
| Formato de pesos | `safetensors` (129 MB), tokenizador en `merges.json` (47 KB), script de inferencia en PyTorch (`termite_classifier.py`) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de 6 capas con ancho 640 y 10 cabezas de atencion, entrenado desde cero sin modelo base. Utiliza un tokenizador propio de 4.096 tokens y procesa secuencias de hasta 256 tokens. El entrenamiento combina una fase de masked language modeling sobre comandos de shell seguida de cinco pasadas de ajuste supervisado sobre tres salidas binarias (si solo lee, si no expone secretos, si es danino), conservando la mejor pasada. Cada salida se calibra posteriormente sobre filas reservadas.

Los datos de entrenamiento comprenden aproximadamente 54.000 comandos no publicados, de los cuales unos 14.000 incluyen etiquetas de las reglas de termite, revisadas manualmente donde las reglas y el modelo profesor discrepaban. El profesor utilizado para etiquetar las tres preguntas fue [termite-decide 0.1](https://huggingface.co/tanepiper/termite-decide-0.8b), de modo que el clasificador hereda sus errores. Las fuentes son NL2SH-ALFA (MIT), nl2shell-training-v3 (Apache 2.0) y filas escritas a mano, que a su vez derivan de NL2Bash (GPL-3.0), tldr-pages (CC BY 4.0), InterCode (MIT) y otros conjuntos sin licencia declarada.

## Capacidades

- Clasificacion de comandos de shell en tres dimensiones binarias: solo lectura, sin exposicion de secretos y potencialmente danino.
- Estimacion de probabilidad calibrada por cada salida, con umbrales fijos (0,85 para `only_reads`, 0,6 para `no_secrets`, 0,3 para `harmful`).
- Procesamiento puramente textual: no ejecuta comandos ni accede al sistema de ficheros.
- Inferencia ligera en CPU con PyTorch, sin servidor ni GPU.
- Comportamiento conservador ante comandos que superan los 256 tokens (devuelve la respuesta estricta).
- No soporta tool calling, agentes, vision, audio ni razonamiento multi-paso.
- Capacidad multilingue: solo ingles, sin pruebas en otros idiomas.

## Casos de uso

- Filtro de pre-vuelo en generacion de comandos: integrar el clasificador como capa adicional que solo pueda endurecer la decision de otras comprobaciones (nunca aprobar lo que otro sistema rechaza), tal como recomienda el autor.
- Auditoria de corpus de comandos: clasificar lotes de comandos historicos para detectar candidatos a revision manual por posible lectura de secretos o cambios destructivos.
- Etiquetado asistido en investigacion sobre seguridad de shell: usar las tres salidas como senal debil para priorizar revision humana en conjuntos grandes.
- Educacion y demostracion: ejemplo didactico de clasificacion de seguridad con un modelo de 32 M de parametros y dependencias minimas (PyTorch y Python).
- Evaluacion comparativa de clasificadores de seguridad: servir como linea base pequena frente a modelos mayores como termite-decide 0.1.
- Prototipado de reglas hibridas: combinar la salida del modelo con reglas fijas de termite para estudiar el solapamiento entre ambos enfoques (el autor reporta coincidencia en 1.000 de 1.129 comandos reservados).

## Benchmarks y rendimiento

El autor publica una tarjeta de puntuacion con resultados sobre conjuntos reservados. Todos los datos proceden de la model card; no se han anadido cifras externas.

| Metrica | Resultado | Objetivo | Estado |
|---|---|---|---|
| Ningun comando de nivel 3 o superior marcado como seguro | 1 | 0 | Fallo |
| Tau frente a la escalera de seguridad | 0,554 | >= 0,698 (termite-decide 0.1) | Fallo |
| Los 14 comandos inofensivos marcados como seguros | 13 de 14 | 14 de 14 | Fallo |

Errores sobre filas de programas no vistos en entrenamiento:

| Pregunta | Errores peligrosos |
|---|---|
| Comando danino clasificado como inofensivo | 22 de 159 |
| Cambio clasificado como solo lectura | 9 de 327 |
| Comando que muestra secretos clasificado como seguro | 1 de 5 |

En la tarea de solo lectura, el modelo acerto 451 de 481 casos, frente a 352 del sistema de reglas fijas de termite. Sobre 1.129 comandos reservados, coincidio con termite-decide 0.1 en 1.000, fue mas laxo en 16 y mas estricto en 113. El autor advierte de que las etiquetas de referencia proceden de las reglas de termite y contienen errores, por lo que estas cifras son orientativas.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en precision FP32 (129 MB de pesos mas activaciones para 256 tokens); cabe en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU moderna (RTX 3060 o superior, A100, H100) es sobredimensionada para este modelo.
- Cabe en GPU consumer: si, en todas, incluidas iGPU y CPUs modestas.
- Despliegue: el autor solo proporciona `termite_classifier.py` con PyTorch. No hay soporte oficial documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El autor solo indica que se probo con PyTorch en un Mac, sin mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Estado |
|---|---|---|---|---|---|
| termite-classifier 0.1 | ~32 M | 256 tokens | Clasificacion de seguridad de comandos shell | Apache 2.0 | Experimental, fallo sus pruebas |
| termite-decide 0.1 | 0,8 B | no disponible | Decision/generacion de comandos shell | no disponible en la informacion | Profesor del clasificador; tau 0,698 |
| Reglas fijas de termite | no aplica | no aplica | Niveles de seguridad por reglas | no aplica | Linea base; 352 aciertos de solo lectura frente a 451 del clasificador |

No se dispone de informacion sobre otros clasificadores de seguridad de shell comparables en la busqueda realizada.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo fallo sus pruebas y que no debe usarse como barrera de seguridad fiable.
- Puede clasificar comandos peligrosos como seguros (22 de 159 en pruebas con programas no vistos).
- Confunde cambios con operaciones de solo lectura en 9 de 327 casos.
- Puede ser demasiado cauto: marco un comando inofensivo como no seguro.
- Es vulnerable a comandos escritos deliberadamente para enganar al clasificador.
- Hereda los errores de su profesor, termite-decide 0.1, y es improbable que supere a este.
- La escalera de seguridad de referencia solo tiene 52 comandos y se ejecuto en macOS.
- Solo se valido con PyTorch en un Mac; no hay pruebas en otros entornos.
- Solo ingles; no se probo ningun otro idioma.
- La licencia Apache 2.0 cubre los pesos, pero las fuentes de datos incluyen material GPL-3.0 (NL2Bash), CC BY 4.0 (tldr-pages) y conjuntos sin licencia declarada, lo que puede afectar a un uso comercial que dependa de la procedencia de los datos.
- La ventana de 256 tokens obliga a devolver la respuesta estricta ante comandos largos, lo que puede generar falsos positivos.
- No hay garantias de calibracion fuera del dominio de comandos de shell en ingles.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/tanepiper/termite-classifier)
- [Perfil del autor en Hugging Face](https://huggingface.co/tanepiper)
- [Repositorio termite en GitHub](https://github.com/tanepiper/termite)
- [termite-decide 0.1 (modelo profesor)](https://huggingface.co/tanepiper/termite-decide-0.8b)
- [Documentacion de la escalera de seguridad](https://tanepiper.github.io/termite/docs/safety-ladder/)
- [Dataset NL2SH-ALFA](https://huggingface.co/datasets/westenfelder/NL2SH-ALFA)
- [Dataset nl2shell-training-v3](https://huggingface.co/datasets/AryaYT/nl2shell-training-v3)
- [NL2Bash](https://github.com/TellinaTool/nl2bash)
- [tldr-pages](https://github.com/tldr-pages/tldr)
- [InterCode](https://github.com/princeton-nlp/intercode)
